const utils = require("../helpers/utils");
const logs = require("../helpers/logs");

const prettyPrint  = utils.requireIfExists("pretty-print-json"); //require("pretty-print-json");

function convertArrayToPrettyHTML(message){

    if(prettyPrint){
        let {prettyPrintJson} = prettyPrint;
        const html = prettyPrintJson.toHtml(message);
        return html
    }else{
        logs.sendErrorToConsole("Pretty print not installed")
    }
}


module.exports =  {
    convertToHTML : convertArrayToPrettyHTML
}