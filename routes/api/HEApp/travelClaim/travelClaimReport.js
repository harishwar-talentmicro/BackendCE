/**
 * Created by vedha on 28-11-2017.
 */
var fs = require('fs');
exports.expenseReport = expenseReport;

function expenseReport(req, res) {
    var htmlString = "";
    var Details = req.data;
    console.log("Details",Details);

    htmlString += '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title>';
    htmlString += "</head><body '><script>";
    htmlString += ' document.writeln(" ';
    htmlString += "<table border='0' cellspacing='0' cellpadding='0' width='100%' style='font-size:80%' >";

    htmlString += "<tbody>";

    htmlString += "<tr bgcolor='#C0E4F9'> ";
    htmlString += "<td width='100%' valign='top' align='center' > <strong>Travel Claim</strong>";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr><td><p></p></td></tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' style='font-size:80%'><strong>Name : </strong> " + Details.name + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' style='font-size:80%' ><strong>Employee Code : </strong> " + Details.employeeCode + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' style='font-size:80%' ><strong>Start Date : </strong> " + Details.starts + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' style='font-size:80%' ><strong>End Date : </strong> " + Details.ends + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%'  valign='top' style='font-size:80%' ><strong>justification : </strong> " + Details.justification + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr>";
    htmlString += "<td width='100%' valign='top'>";
    htmlString += "<table border='1' cellspacing='0' cellpadding='0' align='left' width='100%'  >";
    htmlString += "<tbody>";
    htmlString += "<tr bgcolor='#C0E4F9' style='font-size:80% ;font-weight: bold' >";
    htmlString += "<td  valign='top'>Type</td>";
    htmlString += "<td  valign='top'>Date</td>";
    htmlString += "<td  valign='top'>Particulars</td>";
    htmlString += "<td  valign='top'>Amount</td>";
    htmlString += "<td  valign='top'>Attachments</td>";
    htmlString += "</tr>";
    htmlString += "</tbody>";
    htmlString += "</table>";
    htmlString += "</td>";
    htmlString += "</tr>";


    htmlString += "<tr><td><p></p></td></tr>";
    if (Details.expense.length > 0) {
        // starts
        htmlString += "<tr>";
        htmlString += "<td width='100%' valign='top'>";
        htmlString += "<table border='1' cellspacing='0' cellpadding='0' align='left' width='100%'  >";
        htmlString += "<tbody>";
        htmlString += "<tr bgcolor='#C0E4F9' style='font-size:80% ;font-weight: bold' >";
        htmlString += "<td  valign='top'>Type</td>";
        htmlString += "<td  valign='top'>Date</td>";
        htmlString += "<td  valign='top'>Particulars</td>";
        htmlString += "<td  valign='top'>Amount</td>";
        htmlString += "<td  valign='top'>Attachments</td>";
        htmlString += "</tr>";

        for (var i = 0; i < Details.expense.length; i++) {
            (function (i) {
                htmlString += "<tr>";
                htmlString += "<td  valign='top' style='white-space: nowrap'>" + Details.expense[i].tag + "</td>";
                htmlString += "<td  valign='top' style='white-space: nowrap'>" + Details.expense[i].expDate + "</td>";
                htmlString += "<td  valign='top'>" + Details.expense[i].particulars + "</td>";
                htmlString += "<td  valign='top' style='white-space: nowrap' >" + Details.expense[i].amount + "</td>";
                htmlString += "<td  valign='top'>" + Details.expense[i].attachments + "</td>";
                htmlString += "</tr>";
            })(i);
        }

        htmlString += "</tbody>";
        htmlString += "</table>";
        htmlString += "</td>";
        htmlString += "</tr>";
        // ends
    }
    htmlString += "</tbody>";
    htmlString += '</table>") ;';

    htmlString += "</script></body></html> ";

    res.data = htmlString;
}