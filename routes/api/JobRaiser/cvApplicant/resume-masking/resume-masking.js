var spawn = require("child_process").spawn;
var fs = require("fs");
var resumeMaskingCtrl = {};
var path = require('path');
var uuid = require('node-uuid');
var request = require('request');
var http = require('https');

var error = {};


var convertDocToDocx = function (orgCVPath, callback) {
    let cvpath = "https://storage.googleapis.com/ezeone/" + orgCVPath;
    http.get(cvpath, function (fileResponse) {
        var bufs = [];
        fileResponse.on('data', function (d) { bufs.push(d); });
        fileResponse.on('end', function () {
            var buf = Buffer.concat(bufs);
            fs.writeFileSync(path.resolve(__dirname, orgCVPath), buf);
            console.log('file written');

            let formData = {
                attachment: fs.createReadStream(path.resolve(__dirname, orgCVPath))
            };

            request.post({
                url: "http://23.236.49.140:1002/api/service_attachment_pace",
                formData: formData
            }, function (err, httpRes, body) {
                console.log("service attachment error",err);
                if (!err) {
                    let convDoc = JSON.parse(body).data.a_url;
                    callback(null, convDoc);
                    fs.unlinkSync(path.resolve(__dirname, orgCVPath));
                } else {
                    callback(err, null);
                }
            });
        });
    });
}

// var resume_masking = function (original_path, new_path, header, footer, required_data) {
resumeMaskingCtrl.resume_maskinghttp = function (req, res, next) {

    console.log("guru");
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;



    // if (!req.query.token) {
    //     error.token = 'Invalid token';
    //     validationFlag *= false;
    // }
    // if (!req.query.heMasterId) {
    //     error.heMasterId = 'Invalid company';
    //     validationFlag *= false;
    // }
    // if (!validationFlag) {
    //     response.error = error;
    //     response.message = 'Please check the errors';
    //     res.status(400).json(response);
    //     console.log(response);
    // }
    // else {
    //     req.st.validateToken(req.query.token, function (err, tokenResult) {
    //         if ((!err) && tokenResult) {

    console.log('Inside http api start');

    var inputs = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.heMasterId),
        req.st.db.escape(req.body.applicantId),
        req.st.db.escape(req.body.reqAppId || 0)
    ];

    var procQuery = 'CALL pace_resumeMasking( ' + inputs.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery, function (err, Result) {
        console.log(err);
        console.log(Result);
        if (!err && Result && Result[0] && Result[1] && Result[1][0] && Result[1][0].cvPath != "") {
            try {

                var orgCVPath = Result[1][0].cvPath;
                var clientCVHeader = Result[0][0].clientCVHeader;
                var clientCVFooter = Result[0][0].clientCVFooter;
                var clientCVMaskMobileNo = Result[0][0].clientCVMaskMobileNo;
                var clientCVMaskEmail = Result[0][0].clientCVMaskEmail;
                var logoFile = Result[0][0].logoFile;
                var logoAligment = Result[0][0].logoAligment ? Result[0][0].logoAligment.toUpperCase() : 'LEFT';
                var clientCVHeaderAligment = Result[0][0].clientCVHeaderAligment ? Result[0][0].clientCVHeaderAligment.toUpperCase() : 'LEFT';
                var clientCVFooterAligment = Result[0][0].clientCVFooterAligment ? Result[0][0].clientCVFooterAligment.toUpperCase() : 'LEFT';
            
                // if doc file then first convert it to docx and update the database

                new Promise(function (resolve, reject) {
                    console.log('Inside promise');
                    if (orgCVPath.split('.')[orgCVPath.split('.').length - 1] == 'doc') {  //|| orgCVPath.split('.')[orgCVPath.split('.').length - 1] == 'pdf'
                        convertDocToDocx(orgCVPath, function (err, conres) {
                            try {
                                if (!err && conres) {
                                    console.log("conres",conres);
                                    resolve(conres);  // converted to docx is sent to masking
                                } else {
                                    console.log("convertDocToDocx error");
                                    resolve(orgCVPath);
                                }
                            } catch (ex) {
                                console.log("convertDocToDocx exception",ex);
                                resolve(orgCVPath);
                            }
                        })
                    } else {
                        console.log("convertDocToDocx org docx file");
                        resolve(orgCVPath);
                    }

                }).then(function (resp) {
                    orgCVPath = resp;
                    var uniqueId = uuid.v4();

                    var uniqueId = uniqueId + "." + orgCVPath.split('.')[1];

                    if (logoFile != "") {
                        logoFile = 'https://storage.googleapis.com/ezeone/' + logoFile;
                    }

                    console.log(path.resolve(__dirname, "word.py"), 'https://storage.googleapis.com/ezeone/', orgCVPath, uniqueId, logoFile, clientCVHeader, clientCVFooter, clientCVMaskMobileNo, clientCVMaskEmail,logoAligment,clientCVHeaderAligment,clientCVFooterAligment);

                    var spawn_process = spawn('python', [path.resolve(__dirname, "word.py"), 'https://storage.googleapis.com/ezeone/', orgCVPath, uniqueId, logoFile, clientCVHeader, clientCVFooter, clientCVMaskMobileNo, clientCVMaskEmail,logoAligment,clientCVHeaderAligment,clientCVFooterAligment]);
                    // fs.readFile(path.resolve(__dirname, "word.py"), function (err, res) {
                    //     console.log(err, res);
                    // })
                    // var process = spawn('python', [path.resolve(__dirname, "test.py")]);

                    spawn_process.stdout.on('data', function (data) {
                        console.log(data.toString());
                        if (data.toString().indexOf('File is not a zip file') > -1) {
                            response.status = true;
                            response.error = data.toString();
                            response.message = "Error while masking";
                            res.status(500).json(response);
                            return;
                        }
                        else if (data.toString().indexOf('masked successfully') > -1) {
                            try {

                                var update = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.query.heMasterId),
                                    req.st.db.escape(req.body.applicantId),
                                    req.st.db.escape(req.body.reqAppId || 0),
                                    req.st.db.escape(uniqueId),
                                    req.st.db.escape(orgCVPath)
                                ];

                                var procQuery = 'CALL pace_resumeMaskingUpdate( ' + update.join(',') + ')';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, Result) {
                                    console.log(err);

                                    console.log('output: ' + data.toString());
                                    response.status = true;
                                    response.message = "Success";
                                    response.error = null;
                                    response.data = {
                                        clientCVPath: uniqueId,
                                        orgCVPath : orgCVPath,
                                        mes: data.toString()
                                    };
                                    console.log(response);
                                    res.status(200).json(response);

                                    // res.send(200)
                                });
                            } catch (ex) {
                                console.log(ex);
                                response.status = true;
                                response.message = "Error while masking";
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = true;
                            response.message = "Error while masking";
                            res.status(500).json(response);
                        }
                    })
                })
            } catch (ex) {
                console.log(ex);
                response.status = true;
                response.message = "Error while masking";
                res.status(500).json(response);
            }
        }
        else if (!err) {
            response.status = false;
            response.message = "original resume not found";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
        else {
            response.status = false;
            response.message = "Something went wrong";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }

    });

    //     } else {
    //         res.status(401).json(response);
    //     }
    // });
    // }
};


resumeMaskingCtrl.resume_maskinghttps = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid some error occurred",
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            console.log(err, tokenResult);
            if ((!err) && tokenResult) {


                var heMasterId = req.query.heMasterId;
                var isWeb = req.query.isWeb;
                var token = req.query.token;

                var url = 'http://23.236.49.140:1002/api/v1.1/WM/cv/talentmicro-resume-preparation?heMasterId=' + heMasterId + '&isWeb=' + isWeb;
                console.log("http url", url);

                try {
                    request({

                        url: url,
                        method: "POST",
                        json: true,
                        body: req.body
                    }, function (error, resp, body) {
                        try {
                            if (error) {
                                console.log("rsa error", error);
                            }
                            else {
                                console.log("rsa response", body);
                            }

                            if (typeof (body) == 'string') {
                                body = JSON.parse(body);
                            }

                            res.send(body);
                        } catch (ex) {
                            console.log(ex);
                            res.send(ex.toString());
                        }
                    });

                }
                catch (ex) {
                    console.log(ex);
                    res.send(ex.toString());
                }
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

module.exports = resumeMaskingCtrl;