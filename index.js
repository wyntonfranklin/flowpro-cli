#! /usr/bin/env node

const path = require("path");
const fs = require("fs");
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const flowEngine = require("./assets/engine");

const args = yargs(hideBin(process.argv))
    .option('file', {
        alias: 'f',
        type: 'string',
        description: 'File to run'
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .parse()




let output = "";
//let filename = "C:\\Users\\wfranklin\\Desktop\\wftutorials\\New folder\\char count.flowpro";

let filename = args.file;


if(filename !== null && filename !== undefined) {
    var ext = path.extname(filename);
    if (ext == '.flowpro') {
        let buffer = fs.readFileSync(filename);
        try{
            let fileData = JSON.parse(buffer.toString("utf8"));
            let results = flowEngine.onRunClicked(fileData);
            flowEngine.runFlowPro(results, output, function(res){
                // display current output if not echoed from script option
              //  console.log(res)
            });
        }catch (e){
            console.log("Error parsing file");
        }

    }else{
        console.log("Not a flowpro file");
    }
}
