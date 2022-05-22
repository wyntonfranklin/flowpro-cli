const path = require("path");
const fs = require("fs");
const flowEngine = require("./assets/engine");

let output = "";
let filename = "C:\\Users\\wfranklin\\Desktop\\wftutorials\\New folder\\char count.flowpro";

function runFlowPro(results, output, cb){
    let paths = results.paths;
    let pathsOutput = [];
    if(output == undefined){
        output = null;
    }
    flowEngine.recursiveBlockHandler( paths[0],0, output, function(resp){
        cb(resp)
    });
}

let buffer = fs.readFileSync(filename);
let fileData = JSON.parse(buffer.toString("utf8"));

runFlowPro(flowEngine.onRunClicked(fileData), output, function(res){
    console.log(res)
});

