const path = require("path");
const fs = require("fs");
const flowEngine = require("./assets/engine");

let output = "";
//let filename = "C:\\Users\\wfranklin\\Desktop\\wftutorials\\New folder\\char count.flowpro";
let filename = "C:\\Users\\wfranklin\\Desktop\\wftutorials\\test.flowpro";


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
