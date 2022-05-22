let homeDir = "";
let availableVersions = ["v1","v2"];
const path = require("path");
const world = require("../helpers/world");
const logs = require("../helpers/logs");
let checkedDb = false;
let localVersion = "";
let defaultAppVersion = "v1";

function stripHtml(html)
{
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function getDateTimeObject(){
    let currentDate = new Date();
    return {
        day : currentDate.getDate(),
        month : currentDate.getMonth() + 1,
        year : currentDate.getFullYear(),
        hours : currentDate.getHours(),
        minutes: currentDate.getMinutes(),
        seconds: currentDate.getSeconds()
    }
}

function getNowTime(){
    let dObj = getDateTimeObject();
    return dObj.day + "/" + dObj.month + "/" + dObj.year + " "
        + dObj.hours + ":" + dObj.minutes + ":" + dObj.seconds;
}

function isNull(value){
    if(value == undefined || value == ""){
        return true;
    }
    if(typeof value == "string" && value.length <=0){
        //return true;
    }
    return false;
}

function getVariablesFromString(userinput, delim, trim){
    return getArrayValuesCheckWorld(convertStringToArray(userinput,delim, trim))
}

function getDefaultIfPropNoExists(object, prop, def){
    if(object[prop]){
        return object[prop];
    }
    return def;
}

function convertQueryToObject(text){
    let results = {};
    let params = new URLSearchParams(text);
    for(const [key, value] of params) { // each 'entry' is a [key, value] tupple
        results[key] = value;
    }
    return results;
}

function getQueryStringParseWorld(query){
    let queryObject  = convertQueryToObject(query);
    let results = { };
    const entries = Object.entries(queryObject);
    for (const [key, value] of entries) {
        results[key] = world.parseForWorld(value);
    }
    return results;
}

function getArrayValuesCheckWorld(values){
    let results = [];
    values.forEach(val=>{
        results.push(world.parseForWorld(val))
    });
    return results;
}

function convertStringToArray(input, delim, dotrim){
    let output = input.split(delim);
    let results = [];
    output.forEach(val=>{
        if(dotrim){
            results.push(val.trim())
        }else{
            results.push(val)
        }
    })
    return results;
}

function doesPropExists(properties, num){
    if(properties[num]){
        return properties[num].value
    }
    return null;
}

function getPropertyValue(prop, key, def, checkworld){
    if(prop[key]){
        if(isNull(prop[key].value)){
            return def;
        }else{
            if(checkworld){
                return world.parseForWorld(prop[key].value)
            }else{
                return prop[key].value;
            }
        }
    }else{
        return def;
    }
}

function getPropertyValueAsString(prop, key, def, checkworld){
    if(prop[key]){
        let value = "";
        if(isNull(prop[key].value)){
            value =  def;
        }else{
            value = prop[key].value.trim();
        }
        if(checkworld){
            if(world.variableExists(value)){
                value = world.parseForWorld(value);
            }
            if(Array.isArray(value)){
                value = value.toString();
            }
            return parseTemplateString(value);
        }else{
            return value;
        }
    }else{
        return def;
    }
}

function joinArrayToString(arr){
    let results = "";
    let options = arr;
    options.forEach(item=>{
        results += item;
    });
    return results;
}

function propertiesValidation(settings, conditions, showlog){
    let properties = settings.properties;
    let matches = ["==","!=","<=",">=","<",">"];
    let results = [];
    let conditionsArray = convertStringToArray(conditions, "&", true);
    conditionsArray.forEach(cond=>{
        for(let i=0; i< matches.length; i++){
            let match = matches[i];
            if(cond.includes(match)){
                let evalParams = cond.split(match);
                let propValue = properties[evalParams[0]].value;
                let propName =  properties[evalParams[0]].label;
                let proVal = properties[evalParams[0]].value;
                let ip1 = proVal;
                let ip2 = evalParams[1];
                let state = compareByValue(ip1, match, ip2);
                results.push(state);
                if(!state){
                    logs.sendToConsole(`Validation failed for Label [${propName}] @ Block (${settings.title})`);
                }
                break;
            }
        }
    });
    let status = true;
    results.forEach(val=>{
        if(!val){
            status = false;
        }
    })
    return status;
}

/*
        * = File Type
        *! = String length
 */
function evaluateConditionString(conditions, operand, logoutput){
    let matches = ["==","!=","<=",">=","<",">","*!","^"];
    let results = [];
    conditions.forEach(cond=>{
        if(cond.includes("||")){
            let orParams = cond.split("||");
            console.log(orParams,'or params')
            let orResults = evaluateConditionString(orParams,"OR");
            results = results.concat(orResults);
            console.log(orResults,'or results');
        }else{
            for(let i=0; i< matches.length; i++){
                let match = matches[i];
                if(cond.includes(match)){
                    let evalParams = cond.split(match);
                    let varName = evalParams[0];
                    let ip1 = world.parseForWorld(evalParams[0]);
                    let ip2 = world.parseForWorld(evalParams[1]);
                    let state = compareByValue(ip1, match, ip2);
                    results.push(
                        {
                            'name' : varName,
                            'result' : state,
                            'operand' : operand
                        }
                    );
                    if(!state){
                        if(logoutput){
                            logs.sendToConsole(`Validation failed for ${evalParams[0]}`);
                        }
                    }
                    break;
                }
            }
        }
    });
    return results;
}
function validationHandler(results){
    let orResults = [];
    let andResults = [];
    let orFinal = true;
    let andFinal = true

    results.forEach(valObject=>{
        if(valObject.operand === "OR"){
            orResults.push(valObject.result);
        }
        if(valObject.operand === "AND"){
            andResults.push(valObject.result);
        }
    });
    if(orResults.length >= 1){
        if(orResults.filter(val => val ===true).length >= 1){
            orFinal = true;
        }else{
            orFinal = false;
        }
    }
    if(andResults.length >= 1){
        if(andResults.filter(val=> val === false).length >=1){
            andFinal = false;
        }else{
            andFinal = true;
        }
    }
    console.log(andFinal,"and final");
    console.log(orFinal,"or final");
    return (andFinal && orFinal)
}


function blockValidation(conditions, settings, logoutput){
    let conditionsArray = convertStringToArray(conditions, "&", true);
    let results = evaluateConditionString(conditionsArray,"AND", logoutput);
    return validationHandler(results);
}


function compareByValue(value, condition, compare){
    if(compare=="null"){
        compare= null;
    }
    if(condition == "=="){
        if(value == compare){
            return true;
        }
    }else if(condition == "<"){
        if(value < compare){
            return true;
        }
    }else if(condition === "<="){
        console.log(value,"val to compare");
        console.log(compare,"compare to compare");
        if(value <= compare){
            return true;
        }
    }else if(condition === ">="){
        if(value >= compare){
            return true;
        }
    }else if(condition === "!="){
        if(compare != value){
            return true;
        }
    }else if(condition === ">"){
        if(value > compare){
            return true;
        }
    }else if(condition === "*"){
        let ext = path.extname(value);
        if(ext === compare){
            return true;
        }
    }else if(condition === "^"){
        let txtLenth = value.length;
        if(txtLenth > compare){
            return true;
        }
    }
    return false;
}

function parseTemplateString(template){
    const regexp =  /\{(.*?)\}/g;
    const matches = template.match(regexp);
    if(matches){
        matches.forEach(match=>{
            let vb = match.replace("{","").replace("}","");
            let value = world.parseForWorld(vb);
            template = template.replace(match, value);
        });
    }
    return template;
}

module.exports = {
    getNowTime: getNowTime,
    convertQueryToObject: convertQueryToObject,
    getPropertyValue: getPropertyValue,
    doesPropExists : doesPropExists,
    convertStringToArray : convertStringToArray,
    getArrayValuesCheckWorld : getArrayValuesCheckWorld,
    getQueryStringParseWorld : getQueryStringParseWorld,
    getVariablesFromString : getVariablesFromString,
    joinArrayToString : joinArrayToString,
    compareByValue : compareByValue,
    parseTemplateString : parseTemplateString,
    getPropertyValueAsString: getPropertyValueAsString,
    propertiesValidation : propertiesValidation,
    blockValidation : blockValidation,
    getAvailableVersions : function(){
        return availableVersions;
    },
    getProperty : function(property, index, def){
        if(typeof property[index] !== 'undefined')
        {
            return property[index].value;
        }
        return def;
    },
    getCurrentVersion: function(){
        if(localVersion && checkedDb){
            return localVersion;
        }else{
            localVersion = "v1"
            checkedDb = true;
        }
        return localVersion;
    },
    setCurrentVersion: function(ver){

    },
    errorNoise: function(){
     //   process.stdout.write('\x07');
    },
    defaultSettings : function(defaults, settings){
        return Object.assign({}, defaults, settings);
    },
    progressStart : function(){
       // NProgress.start();
    },
    progressStop : function(){
       // NProgress.done();
    },
    stripHtml : stripHtml,
    requireIfExists : function(file){
        try{
            return require(file)
        }catch (e){
            return null;
        }
    },
    getNowDate : function(){
        let now = new Date().toTimeString();
        return now
    }

}