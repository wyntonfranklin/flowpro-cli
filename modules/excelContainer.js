const utils = require("../helpers/utils");

const excel = utils.requireIfExists('read-excel-file/node'); //require('read-excel-file/node');

// learn more https://www.npmjs.com/package/json-as-xlsx
let xlsx = utils.requireIfExists('json-as-xlsx'); //require('json-as-xlsx');

function getExcelRows(filename, cb){
    excel(filename).then((rows) => {
       cb(rows);
    });

}

function saveToExcel(filepath, headers, data){
    let mySettings = {
        fileName: filepath
    };
    let mydata = [
        {
            sheet: 'Sheet 1',
            columns: headers,
            content: data
        }
    ];
    xlsx(mydata, mySettings)
}

module.exports = {
    getRows : getExcelRows,
    saveToExcel: saveToExcel
}