/**
 * Created by vedha on 28-11-2017.
 */
var fs = require('fs');
exports.expenseReport = expenseReport;

function expenseReport(req, res) {
    var htmlString = "";
    var Details = req.data;

    htmlString += '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title></title>';
    htmlString += "<style>.datagrid table { table-layout:fixed; border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #006699; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #006699), color-stop(1, #00557F) );background:-moz-linear-gradient( center top, #006699 5%, #00557F 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#006699', endColorstr='#00557F');background-color:#006699; color:#FFFFFF; font-size: 13px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { color: #00557F;font-size: 13px;font-weight: normal;word-wrap: break-word; }.datagrid table tbody .alt td { background: #E1EEf4; color: #00557F; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; } .total-row{ border-top:1px solid  #006699;}</style>";
    htmlString += "</head>";
    htmlString += "<body class='datagrid'><script>";
    htmlString += ' document.writeln(" ';
    htmlString += "<table>";

    htmlString += "<tbody>";

    htmlString += "<tr> ";
    htmlString += "<td style='text-align: center;'> <h3>Travel Claim Report</h3>";
    htmlString += "</td>";
    htmlString += "</tr>";
    htmlString += "<table >";
    htmlString += "<tbody>";
    htmlString += "<tr > ";
    htmlString += "<td><strong>Name : </strong> ";
    htmlString += "</td>";
    htmlString += "<td> " + Details.name + " ";
    htmlString += "</td>";
    htmlString += "<td><strong>Employee Code: </strong> ";
    htmlString += "</td>";
    htmlString += "<td> " + Details.employeeCode + " ";
    htmlString += "</td>";
    htmlString += "</tr > ";

    htmlString += "<tr > ";
    htmlString += "<td><strong>Start Date : </strong> ";
    htmlString += "</td>";
    htmlString += "<td>" + Details.starts + " ";
    htmlString += "</td>";
    htmlString += "<td><strong>End Date : </strong> ";
    htmlString += "</td>";
    htmlString += "<td> " + Details.ends + " ";
    htmlString += "</td>";
    htmlString += "</tr > ";
    htmlString += "<tr > ";
    htmlString += "<td><strong>Justification : </strong> ";
    htmlString += "</td>";
    htmlString += "<td> " + Details.justification + " ";
    htmlString += "</td>";
    htmlString += "</tr > ";
    htmlString += "</tbody>";
    htmlString += "</table>";

    htmlString += "<tr><td><p></p></td></tr>";

    if (Details.expense.length > 0) {
        // starts
        htmlString += "<tr>";
        htmlString += "<td>";
        htmlString += "<table>";
        htmlString += "<thead>";
        htmlString += "<tr>";
        htmlString += "<th>Type</th>";
        htmlString += "<th>Date</th>";
        htmlString += "<th>Particulars</th>";
        htmlString += "<th>Amount</th>";
        htmlString += "<th>Attachments</th>";
        htmlString += "</tr>";
        htmlString += "</thead>";
        htmlString += "<tbody>";

        for (var i = 0; i < Details.expense.length; i++) {
            (function (i) {
                if(i%2!=0)
                    htmlString += "<tr class='alt'>";
                else
                    htmlString += "<tr>";
                htmlString += "<td>" + Details.expense[i].tag + "</td>";
                htmlString += "<td>" + Details.expense[i].expDate + "</td>";
                htmlString += "<td>" + Details.expense[i].particulars + "</td>";
                htmlString += "<td style='text-align: right;'>" + Details.expense[i].amount + "</td>";
                // htmlString += "<td>" + Details.expense[i].attachments + "</td>";
                htmlString += "<td>";

                var bills = JSON.parse(JSON.stringify(Details.expense[i].attachments));
                bills = JSON.parse(bills);

                for (var j = 0; j < bills.length; j++) {
                    (function (j) {
                        if(j==0){
                            htmlString += "<a href =" +  bills[j].path + ">Attachment-" + (j+1) + "</a>";
                        }
                        else {
                            htmlString += "<br><a href =" +  bills[j].path + ">Attachment-" + (j+1) + "</a>";
                        }

                    })(j);
                }
                htmlString += "</td>";

                htmlString += "</tr>";
            })(i);
        }
        htmlString += "<tr class='total-row'>";
        htmlString += "<td colspan='3' style='text-align: right;'><strong>" + Details.total + " :</strong></td>";
        htmlString += "<td style='text-align: right;'><strong>" + Details.totalAmount + "</strong></td>";
        htmlString += "<td></td>";
        htmlString += "</tr>";

        htmlString += "<tr class='total-row'>";
        htmlString += "<td colspan='3' style='text-align: right;'><strong>" + Details.advance + " :</strong></td>";
        htmlString += "<td style='text-align: right;'><strong>" + Details.advanceAmount + "</strong></td>";
        htmlString += "<td></td>";
        htmlString += "</tr>";

        htmlString += "<tr class='total-row'>";
        htmlString += "<td colspan='3' style='text-align: right;'><strong>" + Details.totalPayable + " :</strong></td>";
        htmlString += "<td style='text-align: right;'><strong>" + Details.totalPayableAmount + "</strong></td>";
        htmlString += "<td></td>";
        htmlString += "</tr>";

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