var htmlpdf = require('html-pdf');
var DbHelper = require('../../../helpers/DatabaseHandler'),
db = DbHelper.getDBContext();
var CronJob = require('cron').CronJob;
var cron = require('node-cron');

function reports (){

}

// var transactionReportCron = new CronJob({
//         cronTime: '50 8 * * *',
//         onTick: function () {
//     cron.schedule('53 20 * * *', function () {
// console.log("Pace report cron Running!!");
//             usersList();
//     });
            //     },
    //     start: false,
    //     timeZone: 'Asia/Kolkata'
    // });
    // transactionReportCron.start();


    reports.prototype.PeepalReport = function (req) {
    var heMasterId = req.query.heMasterId;
    var userMasterId = req.query.userMasterId;
    var proQuery = 'call pace_report_ForEmail_userDetails_peepal(' + heMasterId + ')';
    console.log(proQuery);
    req.db.query(proQuery, function (err, results) {
        if (!err && results && results[0] && results[0][0]) {

            let userData = results[0];
            console.log('userData', userData.length);

            let sendEachReport = function (index) {
                if (index > userData.length - 1) {
                    console.log("Completed End");
                    return;
                }
                else {
                    let userDataIndex = userData[index];
                    let reportingUserId = userDataIndex.reportingUserId;

                    let fromEmailId = userDataIndex.reportingUserDetails && JSON.parse(userDataIndex.reportingUserDetails) && JSON.parse(userDataIndex.reportingUserDetails).emailId ? JSON.parse(userDataIndex.reportingUserDetails).emailId : "";

                    let toEmailId = userDataIndex.managerDetails && JSON.parse(userDataIndex.managerDetails) && JSON.parse(userDataIndex.managerDetails).emailId ? JSON.parse(userDataIndex.managerDetails).emailId : "";

                    let fromUserName = userDataIndex.reportingUserDetails && JSON.parse(userDataIndex.reportingUserDetails) && JSON.parse(userDataIndex.reportingUserDetails).displayName ? JSON.parse(userDataIndex.reportingUserDetails).displayName : "";

                    let toUserName = userDataIndex.managerDetails && JSON.parse(userDataIndex.managerDetails) && JSON.parse(userDataIndex.managerDetails).displayName ? JSON.parse(userDataIndex.managerDetails).displayName : "";
                    console.log(fromUserName, fromEmailId);

                    if (fromEmailId != "" && toEmailId != "") {
                        var reportQuery = 'call pace_report_transactions_peepal(' + heMasterId + ',' + reportingUserId + ')';
                        console.log(reportQuery);
                        req.db.query(reportQuery, function (reportErr, reportData) {
                            if (!err && reportData) {
                                let htmlContent = "";
                                htmlContent += "<!DOCTYPE html><html><head lang='en'><meta charset='UTF-8'><title></title><body>";
                                htmlContent += "<h2 style='margin-bottom: 0px;'>Daily Transactions Report (" + reportData[1][0].todayDate + "): " + fromUserName;
                                htmlContent += "</h2><br>";

                                if (reportData[0] && reportData[0][0]) {
                                    htmlContent += '<table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;">';
                                    htmlContent += "<thead><th>SL No.</th>";

                                    for (var i = 0; i < Object.keys(reportData[0][0]).length; i++) {
                                        htmlContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + Object.keys(reportData[0][0])[i] + '</th>';
                                    }
                                    htmlContent += "</thead>";

                                    for (var j = 0; j < reportData[0].length; j++) {
                                        htmlContent += '<tr><td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + (j + 1) + '</td>';
                                        for (var i = 0; i < Object.keys(reportData[0][0]).length; i++) {
                                            htmlContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + reportData[0][j][Object.keys(reportData[0][0])[i]] + '</td>';
                                        }
                                        htmlContent += "</tr>";
                                    }

                                    if(reportData[1][0].transactionCount > reportData[0].length){
                                        htmlContent += "<br><a href='https://www.pacehcm.com'>View "+(reportData[1][0].transactionCount-reportData[0].length)+" More</a>";
                                    }
                                }
                                else {
                                    htmlContent += "<br> <h3>NO DATA</h3><br>";
                                }
                                htmlContent += "</table>";

                                
                                htmlContent += "<h2 style='margin-bottom: 0px;'>Daily CV Sourced Report (" + reportData[1][0].todayDate + "): " + fromUserName;
                                htmlContent += "</h2><br>";

                                if (reportData[2] && reportData[2][0]) {
                                    htmlContent += '<table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;">';
                                    htmlContent += "<thead><th>SL No.</th>";

                                    for (var i = 0; i < Object.keys(reportData[2][0]).length; i++) {
                                        htmlContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + Object.keys(reportData[2][0])[i] + '</th>';
                                    }
                                    htmlContent += "</thead>";

                                    for (var j = 0; j < reportData[2].length; j++) {
                                        htmlContent += '<tr><td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + (j + 1) + '</td>';
                                        for (var i = 0; i < Object.keys(reportData[2][0]).length; i++) {
                                            htmlContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + reportData[2][j][Object.keys(reportData[2][0])[i]] + '</td>';
                                        }
                                        htmlContent += "</tr>";
                                    }

                                    if(reportData[3][0].resumeCount > reportData[2].length){
                                        htmlContent += "<br><a href='https://www.pacehcm.com'>View "+(reportData[3][0].resumeCount-reportData[2].length)+" here</a>";
                                    }
                                }
                                else {
                                    htmlContent += "<br> <h3>NO DATA</h3>";
                                }
                                htmlContent += "</table>";

                                htmlContent +="</body></html>";
                                // uncomment the below code to generate pdf
                                // var options = { format: 'A4', width: '16in', height: '8in', border: '0', timeout: 30000, "zoomFactor": "1" };
                                // let attachmentObjectsList = [];
                                // htmlpdf.create(htmlContent, options).toBuffer(function (err, buffer) {
                                //     attachmentObjectsList = [{
                                //         filename: fromUserName + '.pdf',
                                //         content: buffer

                                //     }];

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = fromEmailId;
                                email.to = toEmailId;
                                email.subject = "Daily Report (" + reportData[1][0].todayDate + "): " + fromUserName;
                                email.html = htmlContent;
                                email.cc = ["soumya@jobraiser.com"];
                                email.bcc = ["sundar@talentmicro.com"];

                                //if 1 or more attachments are present
                                // email.addFile({
                                //     filename: attachmentObjectsList[0].filename,
                                //     content: attachmentObjectsList[0].content,
                                //     contentType: "application/pdf"
                                // });

                                sendgrid.send(email, function (err, results) {
                                    if (err) {
                                        console.log("mail not sent", err);
                                        console.log('mail not sent ' + index);
                                        sendEachReport(++index);
                                    }
                                    else {
                                        console.log('Mail sent successfully, plus plus index');
                                        console.log('Success ' + index);
                                        sendEachReport(++index);
                                    }
                                });
                                // });  //generate pdf
                            }
                            else if (!err) {
                                console.log('No transactions found ' + index);
                                sendEachReport(++index);
                            }
                            else {
                                console.log('reportErr', reportErr);
                                console.log('DB Error ' + index);
                                sendEachReport(++index);
                            }
                        });
                    }
                    else {
                        console.log('No fromEmailId or toEmailId' + index);
                        sendEachReport(++index);
                    }

                }

            }
            sendEachReport(0);
        }
        else if (!err) {
            console.log('No reporting managers!');
        }
        else {
            console.log('DB error', err);
        }

    });
}


cron.schedule('00 07 * * *', function () {
    console.log('running a task every minute');
    var datetime = new Date();
    console.log(datetime);
    var procQuery = 'CALL he_schedule_tasks()';
    console.log(procQuery);

    db.query(procQuery, function (err, results) {
        console.log(results);
        if (!err) {
            console.log(err);
        }
        else {
            console.log("success");
        }
    });

});


module.exports = reports;