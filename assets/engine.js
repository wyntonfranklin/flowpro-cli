const engineFunctions = require("../functions/v1");
const world = require("../helpers/world");
const UTILS = require("../helpers/utils");
const logs = require("../helpers/logs")
const path = require("path");

let outputResults;
let blocksByPaths = [];
let currentBlocks = [];
let stopExecution = false;
let rBlockStop = false;
let loopOutput;
let loopIndex;


function exitsInArray(arr, value) {
    for( var i = 0; i <= arr.length-1; i++){
        if ( arr[i] === value) {
            return true;
        }
    }
    return false;
}


function runFromFilePath(filename, output, cb){
    if(filename !== null && filename != undefined){
        var ext = path.extname(filename);
        if(ext == '.flowpro'){
            const buffer = fs.readFileSync(filename);
            let fileData = JSON.parse(buffer.toString("utf8"));
            runFlowPro(onRunClicked(fileData), output, function(res){
                cb(res);
            });
        }
    }
}

function runFlowPro(results, output, cb){
    let paths = results.paths;
    let pathsOutput = [];
    if(output == undefined){
        output = null;
    }
    recursiveBlockHandler( paths[0],0, output, function(resp){
        cb(resp)
    });
}

function getObjectAttributes(data){
    let output = null;
    data.forEach((row)=>{
        if(row["data-object"] !== undefined){
            output =  JSON.parse(row["data-object"]);
        }
    });
    return output;
}

function onRunClicked(data){
    let treeData = data;
    if (treeData) {
        let tree = treeData.blocks;
        let treeLength = tree.length;
        let stack = tree;
        let nodesCount = 0;
        let results = [];
        let currentParent = null;
        let nodeResults = [];
        let visited = [];
        currentBlocks = [];
        blocksByPaths = [];
        let initStart = stack.pop();
        currentParent = initStart.parent;
        let props = getObjectAttributes(initStart.attr);
        visited.push(initStart.id);
        currentBlocks.push(initStart);
        while (stack.length !== 0 && visited.length <= treeLength) {
            for (let i = stack.length - 1; i >= 0; i--) {
                let row = stack[i];
                if (currentParent == row.id) {
                    let props = getObjectAttributes(row.attr);
                    nodeResults.push(props.id);
                    currentBlocks.push(row);
                    if (!exitsInArray(visited, row.id)) {
                        visited.push(row.id);
                    }
                    currentParent = row.parent;
                }
            }
            if (nodeResults.length > 0) {
                results[nodesCount] = nodeResults.reverse();
                nodeResults = [];
                blocksByPaths[nodesCount] = currentBlocks.reverse();
                currentBlocks = [];
                nodesCount++;
            }
            let initStart = stack.pop();
            if (stack.length >= 0 && !exitsInArray(visited, initStart.id)) {
                if (initStart !== undefined) {
                    currentParent = initStart.parent;
                    visited.push(initStart.id);
                    currentBlocks.push(initStart);
                }
            }
            if (visited.length == treeLength) {

            }
        }
        if (nodeResults.length > 0) {
            results[nodesCount] = nodeResults;
            blocksByPaths[nodesCount] = currentBlocks;
        }
        outputResults = results;
        return {
            paths: blocksByPaths,
        }
    }
}


function skipToLoop(nextIndex, blocks,output, cb, action){
    let nextSkipIndex = null;
    for(let i=nextIndex; i < blocks.length; i++){
        let tempAction = blocks[i];
        let tempObject = getObjectAttributes(tempAction.attr);
        if(tempObject.action == action){
            nextSkipIndex = i;
            break;
        }
    }
    if(nextSkipIndex){
        recursiveBlockHandler(blocks, nextSkipIndex+1, output, cb);
    }
}

/* TODO: Fix this */

function showAlertDialog(properties, output){
    let message = UTILS.getPropertyValueAsString(properties, 0, "", true);
    let style = UTILS.getPropertyValue(properties, 1, "white", true);
    let buttonName = UTILS.getPropertyValue(properties, 2, "Click me", true);
    let buttonAction = UTILS.getPropertyValue(properties, 3, "Load Flowpro", false);
    let buttonProperties = UTILS.getPropertyValue(properties, 4, "", true);
    logs.sendToConsole(message);
}

function recursiveBlockHandler(blocks, nextIndex, output, cb){
    if(nextIndex < (blocks.length)){
        let results = null;
        world.addPrivateWorldVariable("coutput", output);
        let action = blocks[nextIndex];
        let actionObject = getObjectAttributes(action.attr);
        let actionProperties = actionObject.properties;
        let blockSettings = {
            name : actionObject.title,
            type : actionObject.type,
            id : action.id
        };
        if(stopExecution == true){
            nextIndex = blocks.length-1;
            logs.sendToConsole(output);
            logs.sendErrorToConsole("Execution haulted");
        }
        if(actionObject.action == "action_stop_execution" ){
            nextIndex =   blocks.length-1;
            logs.sendToConsole(output);
        }
        if(actionObject.action == "action_validate_variables"){
            let conditions = UTILS.getPropertyValue(actionProperties,0, "", false);
            if(!UTILS.blockValidation(conditions,actionObject, true)){
                let actionToTake = UTILS.getPropertyValue(actionProperties, 1, "", false);
                if(actionToTake == "break"){
                    nextIndex =  blocks.length-1;
                }
            }
        }
        if (actionObject.type === "screen") {
            if(actionObject.action == "action_print_output"){
                let userInput = UTILS.getPropertyValueAsString(actionProperties,0, "", true);
                let toOutput = userInput;
                let finalMessage = toOutput;
                logs.sendToConsole(finalMessage);
            }else if(actionObject.action == "action_print_world"){
                logs.sendToConsole(JSON.stringify(world.getWorld()));
                output = world.getWorld();
            }else if(actionObject.action == "output_results_in_window"){
                screenOutput(actionProperties, output);
            }else if(actionObject.action == "output_results"){
                logs.sendToConsole(output,"console");
            }else if(actionObject.action == "output_to_view"){
                let viewId = UTILS.getPropertyValue(actionProperties,0, "", false);
                let viewOption = UTILS.getPropertyValue(actionProperties,1, "overwrite", false);
                logs.sendToConsole(output)
            }else if(actionObject.action == "action_alert_dialog"){
                showAlertDialog(actionProperties, output);
            }
        }
        if(actionObject.type == "loop"){
            if(actionObject.action == "forloop"){
                let max = UTILS.getPropertyValue(actionProperties,0, output, true);
                nextIndex++;
                handleForLoop(blocks, nextIndex, output, max);
                skipToLoop(nextIndex, blocks, output, cb, "action_end_loop");
                output = loopOutput;
                nextIndex = loopIndex;
                world.addPrivateWorldVariable("coutput", output);
            }else if(actionObject.action == "foreach"){
                nextIndex = nextIndex+1;
                let loopInput =  UTILS.getPropertyValue(actionProperties,0, output, true);
                handleForLoopByInput(blocks, nextIndex, loopInput);
                // skip to last loop
                skipToLoop(nextIndex, blocks, output, cb, "action_end_loop");
                output = loopOutput;
                nextIndex = loopIndex;
                world.addPrivateWorldVariable("coutput", output);
            }else if(actionObject.action == "action_while"){
                nextIndex++;
                handleWhileLoop(blocks, nextIndex, output, actionProperties);
                output = loopOutput;
                nextIndex = loopIndex;
                world.addPrivateWorldVariable("coutput", output);
            }else if(actionObject.action == "action_repeat_for"){
                nextIndex++;
                handleLoopBlocks(blocks,nextIndex, output, actionProperties);
                output = loopOutput;
                nextIndex = loopIndex;
            }else if(actionObject.action == "action_end_loop"){
                nextIndex = blocks.length;
                return true;
            }
        } else if(actionObject.type == "conditional"){

        }

        if(actionObject.type == "file"){
            if(actionObject.action == "action_file_function"){
                world.setToLocal();
            }
            let filename =  UTILS.getPropertyValueAsString(actionProperties, 0, "", true);

            if(filename == "" || filename == undefined){
                // logs.add("File name cannot be blank", blockSettings);
            }
            if(UTILS.propertiesValidation(actionObject, "0!=")){
                try{
                    /* TODO: fun from file path */
                    runFromFilePath(filename, output, function(result){
                        output = result;
                        recursiveBlockHandler(blocks, nextIndex+1, output, cb);
                    });
                }catch (e){
                    logs.sendToConsole(e);
                }
            }
            if(actionObject.action == "action_file_function"){
                world.setToWorld();
            }
             world.addPrivateWorldVariable("coutput", output);
        }else {
            if(engineFunctions[actionObject.action] !== undefined  && typeof engineFunctions[actionObject.action] == "function" && !rBlockStop){
                engineFunctions[actionObject.action](actionProperties, output, function(resp){
                    let loopOutput;
                    let loopIndex;
                    if (actionObject.type == "conditional") {
                        if (!resp) {
                            let nextEndIfIndex = null;
                            for (let i = nextIndex; i < blocks.length; i++) {
                                let tempAction = blocks[i];
                                let tempObject = getObjectAttributes(tempAction.attr);
                                if (tempObject.action == "endif") {
                                    nextEndIfIndex = i;
                                    break;
                                }
                            }
                            if (nextEndIfIndex) {
                                recursiveBlockHandler(blocks, nextEndIfIndex + 1, output, cb);
                            }
                        } else {
                            nextIndex++;
                            loopOutput = output;
                            loopIndex = nextIndex;
                            recursiveBlockHandler(blocks, nextIndex, output, cb);
                        }
                    } else {
                        output = resp;
                        nextIndex++;
                        loopOutput = output;
                        loopIndex = nextIndex;
                        recursiveBlockHandler(blocks, nextIndex, output, cb);
                    }
                }, actionObject);
            }else{
                nextIndex++;
                recursiveBlockHandler(blocks, nextIndex, output, cb);
            }
        }
    }else{
        if(typeof cb == "function"){
            cb(output);
        }
    }
}


function handleConditionalBlock(blocks, nextIndex, output, properties){
    let tempAction = blocks[nextIndex];
    let tempObject = getObjectAttributes(tempAction.attr);
    if(tempObject.action == "endif"){

    }else{
        handleConditionalBlock(blocks, nextIndex, output, properties);
        recursiveBlockHandler(blocks, nextIndex, output, function(output){

        })
    }
}


function handleLoopBlocks(blocks, nextIndex, output, properties){
    setTimeout(function(){
        recursiveBlockHandler(blocks, nextIndex, output);
    },2000);
}


function handleWhileLoop(blocks, nextIndex, output, properties){
    let ip1 = UTILS.getPropertyValue(properties, 0, output, true);
    let condition = UTILS.getPropertyValue(properties, 1, "", false);
    let ip2 = UTILS.getPropertyValue(properties, 2, "", true);
    if (UTILS.compareByValue(ip1, condition, ip2)){
        recursiveBlockHandler(blocks, nextIndex, output);
        handleWhileLoop(blocks, nextIndex, output, properties);
        ip1 = UTILS.getPropertyValue(properties, 0, "", true);
    }
}


function handleForLoop(blocks, nextIndex, output, loops){
    let finalOutput = null;
    for(let i=1; i<= loops; i++){
        world.addPrivateWorldVariable("cindex", i);
        recursiveBlockHandler(blocks, nextIndex, output);
    }
}


function handleForLoopByInput(blocks, nextIndex, output){
    let original = output;
    let finalOutput = null;
    let prev = "";
    let index = 0;
    if(Array.isArray(output)){
        output.forEach((item, i)=>{
            world.addPrivateWorldVariable("cindex", i);
            recursiveBlockHandler(blocks, nextIndex, item);
        })
        handleLoopByArray(blocks,nextIndex, output);
    }else if(typeof output == "object"){
        for (const key in output) {
            world.addPrivateWorldVariable("cindex", key);
            recursiveBlockHandler(blocks, nextIndex, output[key]);
        }

    }
}

function handleLoopByArray(blocks, nextIndex, dataset){
    let currentInput = dataset.pop();
    recursiveBlockHandler(blocks, nextIndex, currentInput);
    if(dataset.length > 0){
        handleLoopByArray(blocks, nextIndex, dataset );
    }
}



function manageInputs(ip1){
    if(ip1 == null){
        return "";
    }else if(Array.isArray(ip1)){
        let o = "";
        ip1.forEach(input=>{
            o += input;
        })
        return o;
    }
    return ip1;
}

function getInputAsString(input){
    if(Array.isArray(input)){
        return input.toString();
    }
    return input;
}


function screenOutput(properties, output){
    let screenTitle = UTILS.getPropertyValue(properties,0,"", true);
    let screenDescription = UTILS.getPropertyValue(properties, 1, "", true);
    let screenStyling = UTILS.getPropertyValue(properties, 2, "", false);
    logs.sendToConsole(output);
    /* todo: fix
    ipcRenderer.invoke('open-window','screen',
        {
            message :  output,
            styling: screenStyling,
            title: screenTitle,
            excerpt : screenDescription
        });*/
}


module.exports =  {
    onRunClicked : onRunClicked,
    recursiveBlockHandler: recursiveBlockHandler,
    runFlowPro : runFlowPro
}