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
    htmlString += "<td width='100%' valign='top' align='center' > <strong>Expense Claim</strong>";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr><td><p></p></td></tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' ><strong>Name : </strong> " + Details.name + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr > ";
    htmlString += "<td width='100%' valign='top' ><strong>Employee Code : </strong> " + Details.employeeCode + " ";
    htmlString += "</td>";
    htmlString += "</tr>";

    htmlString += "<tr><td><p></p></td></tr>";
    if (Details.expense.length > 0) {
        // starts
        htmlString += "<tr>";
        htmlString += "<td width='100%' valign='top'>";
        htmlString += "<table border='1' cellspacing='0' cellpadding='0' align='left' width='100%' style='font-size:80%' >";
        htmlString += "<tbody>";
        htmlString += "<tr>";
        htmlString += "<td  valign='top'>Expense</td>";
        htmlString += "<td  valign='top'>Date</td>";
        htmlString += "<td  valign='top'>particulars</td>";
        htmlString += "<td  valign='top'>amount</td>";
        htmlString += "<td  valign='top'>attachments</td>";

        htmlString += "</tr>";

        for (var i = 0; i < Details.expense.length; i++) {
            (function (i) {
                htmlString += "<tr>";
                htmlString += "<td  valign='top'>" + Details.expense[i].tag + "</td>";
                htmlString += "<td  valign='top'>" + Details.expense[i].expDate + "</td>";
                htmlString += "<td  valign='top'>" + Details.expense[i].particulars + "</td>";
                htmlString += "<td  valign='top'>" + Details.expense[i].amount + "</td>";
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