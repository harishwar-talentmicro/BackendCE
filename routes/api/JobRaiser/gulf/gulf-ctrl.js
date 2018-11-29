var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var http = require('https');
var bodyParser = require('body-parser');
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var applicantCtrl = {};
var error = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var gulfCtrl = {};
var error = {};

gulfCtrl.saveMedical = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
    }
    if (!req.body.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag = false;
    }
    var currency = req.body.currency;
    if (typeof (currency) == "string") {
        currency = JSON.parse(currency);
    }
    if (!currency) {
        currency = {};
    }
    var scale = req.body.scale;
    if (typeof (scale) == "string") {
        scale = JSON.parse(scale);
    }
    if (!scale) {
        scale = {};
    }

    var gamcaMedicalCentre = req.body.gamcaMedicalCentre;
    if (typeof (gamcaMedicalCentre) == "string") {
        gamcaMedicalCentre = JSON.parse(gamcaMedicalCentre);
    }
    if (!gamcaMedicalCentre) {
        gamcaMedicalCentre = {};
    }

    var cdnFilePath = req.body.cdnFilePath;
    if (typeof (cdnFilePath) == "string") {
        cdnFilePath = JSON.parse(cdnFilePath);
    }
    if (!cdnFilePath) {
        cdnFilePath = [];
    }

    var medicalNotes = req.body.medicalNotes;
    if (typeof (medicalNotes) == "string") {
        medicalNotes = JSON.parse(medicalNotes);
    }
    if (!medicalNotes) {
        medicalNotes = {};
    }
    
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.body.medicalId = (req.body.medicalId) ? req.body.medicalId : 0;
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 1;
                req.body.scaleId = (req.body.scaleId) ? req.body.scaleId : 1;
                req.body.tokenNumber = (req.body.tokenNumber) ? req.body.tokenNumber : 0;
                // req.body.medicalNotes = (req.body.medicalNotes) ? req.body.medicalNotes : "";
                req.body.notes = (req.body.notes) ? req.body.notes : "";
                req.body.medicalStatus = (req.body.medicalStatus) ? req.body.medicalStatus : 0;
                req.body.medicalStage = (req.body.medicalStage) ? req.body.medicalStage : 0;
                req.body.isGamca = (req.body.isGamca) ? req.body.isGamca : 0;
                

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.medicalId),                    
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.billTo),
                    req.st.db.escape(req.body.amount),
                    req.st.db.escape(JSON.stringify(currency)),
                    req.st.db.escape(JSON.stringify(scale)),
                    req.st.db.escape(req.body.receivedDate),
                    req.st.db.escape(req.body.sentDate),
                    req.st.db.escape(req.body.date),
                    req.st.db.escape(req.body.tokenNumber),
                    req.st.db.escape(req.body.MOFANumber),
                    req.st.db.escape(req.body.medicalStatus),
                    req.st.db.escape(JSON.stringify(medicalNotes)),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.reMedical),
                    req.st.db.escape(req.body.medicalStage),
                    req.st.db.escape(JSON.stringify(gamcaMedicalCentre)),
                    req.st.db.escape(JSON.stringify(cdnFilePath)),
                    req.st.db.escape(req.body.isGamca),
                    req.st.db.escape(req.body.clinicName || ""),
                    req.st.db.escape(req.body.clinicAddress || "")
                    
                ];
            
                var procQuery = 'CALL wm_save_1010_medical( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result && Result[0][0]) {
                        response.status = true;
                        response.message = "Medical data saved successfully";
                        response.error = null;
                        response.data = {
                            medicalId: Result[0][0].medicalId,
                            transactionHistory: (Result[1] && Result[1][0]) ? Result[1]:[]
                        };
                        res.status(200).json(response);
                    }
                    
                    else {
                        response.status = false;
                        response.message = "Error while saving medical data";
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



gulfCtrl.getMedical = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
    }
    if (!req.query.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag = false;
    }
    
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
            
                
                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqApplicantId)                    
                ];

                var procQuery = 'CALL wm_get_medical( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result[0] || Result[1] || Result[2]) {
                        response.status = true;
                        response.message = "Medical data loaded successfully";
                        response.error = null;
                        
                        if (Result[0][0]) {
                            Result[0][0].currency=(Result[0] && Result[0][0] && JSON.parse(Result[0][0].currency).currencyId) ? JSON.parse(Result[0][0].currency):{};

                            Result[0][0].scale=(Result[0] && Result[0][0] && JSON.parse(Result[0][0].scale).scaleId) ? JSON.parse(Result[0][0].scale):{};    

                            Result[0][0].gamcaMedicalCentre=(Result[0] && Result[0][0] && JSON.parse(Result[0][0].gamcaMedicalCentre).medicalCentreId) ? JSON.parse(Result[0][0].gamcaMedicalCentre):{};    

                            Result[0][0].cdnFilePath=(Result[0] && Result[0][0] && Result[0] && Result[0][0].cdnFilePath) ? JSON.parse(Result[0][0].cdnFilePath):[];    
                           
                            Result[0][0].medicalNotes=(Result[0] && Result[0][0] && Result[0] && Result[0][0].medicalNotes) ? JSON.parse(Result[0][0].medicalNotes):{};    
                            
                        } 

                        for (var i=0;i<Result[2].length;i++){
                            Result[2][i].stateWiseList = (Result[2][i] && Result[2][i]) ? JSON.parse(Result[2][i].stateWiseList):[];

                            for(var j=0;j<Result[2][i].stateWiseList.length;j++){
                                Result[2][i].stateWiseList[j].medicalCentreList = (Result[2][i].stateWiseList[j]) ? JSON.parse(Result[2][i].stateWiseList[j].medicalCentreList) :[];
                            }
                        
                        }


                        response.data = {   
                            medicalDetails: Result[0][0],
                            medicalNotes : Result[1],
                            allMedicalCentreList : Result[2] ? Result[2]:[],
                            medicalHistory : Result[3] && Result[3][0] && Result[3][0].medicalHistory ? JSON.parse(Result[3][0].medicalHistory) : []
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            medicalDetails: {},
                            medicalNotes:[],
                            allMedicalCentreList:[]

                        };
                        res.status(200).json(response);
                    }              
                    else {
                        response.status = false;
                        response.message = "Error while loading medical data";
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


gulfCtrl.saveDeparture = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
    if (!req.body.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }

    var departureCurrency = req.body.departureCurrency;
    if (typeof (departureCurrency) == "string") {
        departureCurrency = JSON.parse(departureCurrency);
    }
    if (!departureCurrency) {
        departureCurrency = {};
    }
    var departureCurrencyScale = req.body.departureCurrencyScale;
    if (typeof (departureCurrencyScale) == "string") {
        departureCurrencyScale = JSON.parse(departureCurrencyScale);
    }
    if (!departureCurrencyScale) {
        departureCurrencyScale = {};
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                // req.query.apiKey = req.query.apiKey ? req.query.apiKey : 0;
                req.body.applicantId = req.body.applicantId ? req.body.applicantId : 0;
                req.body.requirementId = req.body.requirementId ? req.body.requirementId : 0;
                req.body.statusId = req.body.statusId ? req.body.statusId : 0;
                req.body.applicantName = req.body.applicantName ? req.body.applicantName : '';
                req.body.joiningDate = req.body.joiningDate ? req.body.joiningDate : null;
                req.body.travelDateFrom = req.body.travelDateFrom ? req.body.travelDateFrom : null;
                req.body.travelDateTo = req.body.travelDateTo ? req.body.travelDateTo : null;
                req.body.airlines = req.body.airlines ? req.body.airlines : '';
                req.body.tickets = req.body.tickets ? req.body.tickets : '';
                req.body.pnrNumber = req.body.pnrNumber ? req.body.pnrNumber : '';
                req.body.airlineStatus = req.body.airlineStatus ? req.body.airlineStatus : 0;
                req.body.departureAmount = req.body.departureAmount ? req.body.departureAmount : 0.0;
                req.body.billTo = req.body.billTo ? req.body.billTo : 0;
                req.body.creditNoteNumber = req.body.creditNoteNumber ? req.body.creditNoteNumber : '';
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.isClearanceGiven = req.body.isClearanceGiven ? req.body.isClearanceGiven : 0;
                req.body.spokeToCandidateToDepart = req.body.spokeToCandidateToDepart ? req.body.spokeToCandidateToDepart : 0;
                req.body.receivedCandidateArrivalInfo = req.body.receivedCandidateArrivalInfo ? req.body.receivedCandidateArrivalInfo : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(req.body.applicantName),
                    req.st.db.escape(req.body.joiningDate),
                    req.st.db.escape(req.body.travelDateFrom),
                    req.st.db.escape(req.body.travelDateTo),
                    req.st.db.escape(req.body.airlines),
                    req.st.db.escape(req.body.tickets),
                    req.st.db.escape(req.body.pnrNumber),
                    req.st.db.escape(req.body.airlineStatus),
                    req.st.db.escape(JSON.stringify(departureCurrency)),
                    req.st.db.escape(req.body.departureAmount),
                    req.st.db.escape(JSON.stringify(departureCurrencyScale)),
                    req.st.db.escape(req.body.creditNoteNumber),
                    req.st.db.escape(req.body.billTo),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.isClearanceGiven),
                    req.st.db.escape(req.body.spokeToCandidateToDepart),
                    req.st.db.escape(req.body.receivedCandidateArrivalInfo),
                    req.st.db.escape(req.body.stageId)
                ];
                var procQuery = 'CALL wm_save_paceDeparture( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0][0]) {
                        response.status = true;
                        response.message = "Departure data saved sucessfully";
                        response.error = null;
                        results[0][0].departureCurrency= results[0][0].departureCurrency ? JSON.parse(results[0][0].departureCurrency):{};
                        results[0][0].departureCurrencyScale= results[0][0].departureCurrencyScale ? JSON.parse(results[0][0].departureCurrencyScale):{};                        
                        response.data = {
                            departureDetails: (results[0] && results[0][0]) ? results[0][0]:{},
                            transactionHistory:(results[1] && results[1][0]) ? results[1]:[]
                        }
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while saving departure data";
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

gulfCtrl.getDeparture = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!req.query.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqApplicantId)
                ];

                var procQuery = 'CALL wm_get_paceDeparture( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Departure data loaded successfully";
                        response.error = null;
                        result[0][0].departureCurrency= result[0][0].departureCurrency ? JSON.parse(result[0][0].departureCurrency):{};
                        result[0][0].departureCurrencyScale= result[0][0].departureCurrencyScale ? JSON.parse(result[0][0].departureCurrencyScale):{};

                        response.data = (result && result[0] && result[0][0]) ? result[0][0] : {};
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data ={};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting departure data";
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

gulfCtrl.saveVisa = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
    if (!req.body.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }

    var visaCurrency = req.body.visaCurrency;
    if (typeof (visaCurrency) == "string") {
        visaCurrency = JSON.parse(visaCurrency);
    }
    if (!visaCurrency) {
        visaCurrency = {};
    }
    var visaScale = req.body.visaScale;
    if (typeof (visaScale) == "string") {
        visaScale = JSON.parse(visaScale);
    }
    if (!visaScale) {
        visaScale = {};
    }
    var country = req.body.country;
    if (typeof (country) == "string") {
        country = JSON.parse(country);
    }
    if (!country) {
        country = {};
    }
    
    var cdnFilePath = req.body.cdnFilePath;
    if (typeof (cdnFilePath) == "string") {
        cdnFilePath = JSON.parse(cdnFilePath);
    }
    if (!cdnFilePath) {
        cdnFilePath = {};
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.applicantName = req.body.applicantName ? req.body.applicantName : '';
                req.body.applicantId = req.body.applicantId ? req.body.applicantId : 0;
                req.body.requirementId = req.body.requirementId ? req.body.requirementId : 0;
                req.body.visaStatus = req.body.visaStatus ? req.body.visaStatus : 0;
                req.body.visaNumber = req.body.visaNumber ? req.body.visaNumber : '';
                req.body.dateOfIssue = req.body.dateOfIssue ? req.body.dateOfIssue : null;
                req.body.dateOfExpiry = req.body.dateOfExpiry ? req.body.dateOfExpiry : null;
                req.body.visaType = req.body.visaType ? req.body.visaType : '';
                req.body.visaDateOfIssue = req.body.visaDateOfIssue ? req.body.visaDateOfIssue : null;
                req.body.visaDateOfExpiry = req.body.visaDateOfExpiry ? req.body.visaDateOfExpiry : null;
                req.body.authority = req.body.authority ? req.body.authority : '';
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.visaSponsor = req.body.visaSponsor ? req.body.visaSponsor : '';
                req.body.travelStatus = req.body.travelStatus ? req.body.travelStatus : 0;
                req.body.pickUpDatetime = req.body.pickUpDatetime ? req.body.pickUpDatetime : null;
                req.body.pickUpFrom = req.body.pickUpFrom ? req.body.pickUpFrom : '';
                req.body.dropTo = req.body.dropTo ? req.body.dropTo : '';
                req.body.airlines = req.body.airlines ? req.body.airlines : '';
                req.body.ticketNumber = req.body.ticketNumber ? req.body.ticketNumber : '';
                req.body.insuranceReferenceNumber = req.body.insuranceReferenceNumber ? req.body.insuranceReferenceNumber : '';
                req.body.validityFrom = req.body.validityFrom ? req.body.validityFrom : null;
                req.body.validityTo = req.body.validityTo ? req.body.validityTo : null;
                req.body.coverageDetails = req.body.coverageDetails ? req.body.coverageDetails : '';
                req.body.billTo = req.body.billTo ? req.body.billTo : 0;
                req.body.visaAmount = req.body.visaAmount ? req.body.visaAmount : 0.0;
                req.body.passportNumber = req.body.passportNumber ? req.body.passportNumber : '';
                req.body.stageId = req.body.stageId ? req.body.stageId : 0;
                req.body.statusId = req.body.statusId ? req.body.statusId : 0;
                req.body.ecr = req.body.ecr ? req.body.ecr : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(req.body.applicantName),
                    req.st.db.escape(req.body.passportNumber),
                    req.st.db.escape(req.body.visaNumber),
                    req.st.db.escape(req.body.visaStatus),
                    req.st.db.escape(req.body.dateOfIssue),
                    req.st.db.escape(req.body.dateOfExpiry),
                    req.st.db.escape(req.body.visaType),
                    req.st.db.escape(JSON.stringify(country)),
                    req.st.db.escape(req.body.visaDateOfIssue),
                    req.st.db.escape(req.body.visaDateOfExpiry),
                    req.st.db.escape(req.body.authority),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.visaSponsor),
                    req.st.db.escape(req.body.travelStatus),
                    req.st.db.escape(req.body.pickUpDatetime),
                    req.st.db.escape(req.body.pickUpFrom),
                    req.st.db.escape(req.body.dropTo),
                    req.st.db.escape(req.body.airlines),
                    req.st.db.escape(req.body.ticketNumber),
                    req.st.db.escape(req.body.insuranceReferenceNumber),
                    req.st.db.escape(req.body.validityFrom),
                    req.st.db.escape(req.body.validityTo),
                    req.st.db.escape(req.body.coverageDetails),
                    req.st.db.escape(req.body.billTo),
                    req.st.db.escape(JSON.stringify(visaCurrency)),
                    req.st.db.escape(JSON.stringify(visaScale)),
                    req.st.db.escape(req.body.visaAmount),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(req.body.ecr),
                    req.st.db.escape(JSON.stringify(cdnFilePath))
                
                ];
                var procQuery = 'CALL wm_save_paceVisa( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Visa data saved sucessfully";
                        response.error = null;
                        result[0][0].visaCurrency=result[0][0].visaCurrency ? JSON.parse(result[0][0].visaCurrency):{};
                        result[0][0].country=result[0][0].country ? JSON.parse(result[0][0].country):{};
                        result[0][0].visaScale=result[0][0].visaScale ? JSON.parse(result[0][0].visaScale):{};                    
                        result[0][0].cdnFilePath=result[0][0].cdnFilePath ? JSON.parse(result[0][0].cdnFilePath):{};
                        
                        response.data = {
                            visaDetails: (result[0] && result[0][0]) ? result[0][0]:{},
                            transactionHistory: (result[1] && result[1][0]) ? result[1]:[]
                        }
                        
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while saving visa data";
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

gulfCtrl.getVisa = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!req.query.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqApplicantId)
                ];

                var procQuery = 'CALL wm_get_paceVisa( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Visa data loaded successfully";
                        response.error = null;
                        result[0][0].visaCurrency=result[0][0].visaCurrency ? JSON.parse(result[0][0].visaCurrency):{};
                        result[0][0].country=result[0][0].country ? JSON.parse(result[0][0].country):{};
                        result[0][0].visaScale=result[0][0].visaScale ? JSON.parse(result[0][0].visaScale):{}; 
                        result[0][0].cdnFilePath=result[0][0].cdnFilePath ? JSON.parse(result[0][0].cdnFilePath):{};

                        response.data = (result && result[0] && result[0][0]) ? result[0][0] : {};
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data ={};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting visa data";
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


gulfCtrl.saveAttestation = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
    if (!req.body.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }

    var attestation = req.body.attestation;
    if (typeof (attestation) == "string") {
        attestation = JSON.parse(attestation);
    }
    if (!attestation) {
        attestation = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.applicantName = req.body.applicantName ? req.body.applicantName : '';
                req.body.applicantId = req.body.applicantId ? req.body.applicantId : 0;
                req.body.requirementId = req.body.requirementId ? req.body.requirementId : 0;
                req.body.statusId = req.body.statusId ? req.body.statusId : 0;
                req.body.stageId = req.body.stageId ? req.body.stageId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(req.body.applicantName),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(JSON.stringify(attestation)),
                    req.st.db.escape(req.body.stageId)
                ];
                var procQuery = 'CALL wm_save_paceAttestation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Attestation data saved sucessfully";
                        response.error = null;

                        result[0][0].attestation=(result[0][0].attestation) ? JSON.parse(result[0][0].attestation):[];
                        if(result[0][0].attestation){
                            var temp=[];
                            for(var i = 0; i<result[0][0].attestation.length ; i++){
                               
                                result[0][0].attestation[i].attestationDoc=result[0][0].attestation[i].attestationDoc ? JSON.parse(result[0][0].attestation[i].attestationDoc):[];
                                
                                temp.push(result[0][0].attestation[i]);
                            }
                            result[0][0].attestation=temp;
                        }
                        response.data = {
                            attestationDetails: (result[0] && result[0][0]) ? result[0][0]:{},
                            transactionHistory: (result[1] && result[1][0]) ? result[1]:[]
                        }
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while saving Attestation data";
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

gulfCtrl.getAttestation = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!req.query.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqApplicantId)
                ];

                var procQuery = 'CALL wm_get_paceAttestation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Attestation data loaded successfully";
                        response.error = null;
                        
                        result[0][0].attestation=(result[0][0].attestation) ? JSON.parse(result[0][0].attestation):[];
                        if(result[0][0].attestation){
                            var temp=[];
                            for(var i = 0; i<result[0][0].attestation.length ; i++){
                               
                                result[0][0].attestation[i].attestationDoc=result[0][0].attestation[i].attestationDoc ? JSON.parse(result[0][0].attestation[i].attestationDoc):[];
                                
                                temp.push(result[0][0].attestation[i]);
                            }
                            result[0][0].attestation=temp;
                        }
                        response.data = result[0][0];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data =[];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting attestation data";
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

module.exports = gulfCtrl;