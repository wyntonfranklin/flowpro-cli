const world = require("../helpers/world");
const fs = require('fs');
const logs = require("../helpers/logs");
const UTILS = require("../helpers/utils");
const fetch = require("cross-fetch")

const mysqlHandler = require("../modules/sqlContainer");
const commandHandler = require("../modules/commandContainer");
const excelHandler = require("../modules/excelContainer");
const emailHandler = require("../modules/mailContainer");
const xmlHandler = require("../modules/xmlContainer");
const ftpHandler = require("../modules/ftpContainer");
const extraModsHandler = require("../modules/extraMods");
//const notificationHandler = require("../helpers/notifications");

const path = require("path");
const mv = require('mv');
const moment = require('moment'); // require
const markdown = require( "markdown" ).markdown;
const open = require('open');
const sound = require("sound-play");
const https = require('https');

function stripHtml(html)
{
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}


function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
        now = Date.now();
    }
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

module.exports = {
    add_two_numbers : function(properties, output, cb){
        let numbers = (properties[0].value) ? properties[0].value : output;
        let values = UTILS.getVariablesFromString(numbers,",", true);
        let results = 0;
        values.forEach(val=>{
            results += parseFloat(val);
        })
        cb(results);
    },
    action_math_ceil : function(properties, output, cb, settings){
        let value = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.ceil(value));
    },
    long_text_input : function(properties, output, cb){
        let o = UTILS.getPropertyValueAsString(properties, 0, output, true);
        cb(o);
    },
    short_text_input : function(properties, output, cb){
        let userinput = UTILS.getPropertyValue(properties, 0, output, true);
        cb(userinput);
    },
    numerical_text_input : function(properties, output, cb){
        let results = "";
        properties.forEach(prop=>{
            if(prop.value !== null){
                results = prop.value;

            }
        })
        cb(results);
    },
    action_split_text : function (properties, output, cb){
        let o = [];
        let input = properties[0].value;
        try{
            o = output.split(input)
            cb(o);
        }catch (e){
            logs.logger.error(e);
        }
    }
    ,
    action_find_replace : function (properties, output, cb){
        let find = properties[0].value;
        let replace = properties[1].value;
        var re = new RegExp(find, "gi")
        cb(output.replace(re, replace));
    },
    action_char_count : function(properties, output, cb){
        let userinput = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        var charCount = Array.from(userinput).length;
        cb(charCount);
    },
    action_word_count : function(properties, output, cb){
        let userinput = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        var text = userinput.split(' ');
        var wordCount = 0;
        for (var i = 0; i < text.length; i++) {
            if (text[i] !== ' ') {
                wordCount++;
            }
        }
        cb(wordCount);
    },
    do_nothing: function(properties, output, cb){
        cb(output);
    },
    action_prepend_string : function(properties, output, cb){
        let append = UTILS.getPropertyValue(properties,0, output, true);
        let prepend = UTILS.getPropertyValue(properties, 1, "", true);
        cb(append + output  + prepend);
    },
    action_concat_string : function (properties, output, cb){
        let userinput = UTILS.getPropertyValue(properties, 0, output, true);
        let userinput2 = UTILS.getPropertyValue(properties, 1, "", true);
        cb(userinput + userinput2);
    },
    action_concat_assign_string : function(properties, output,cb){
        let userinput = UTILS.getPropertyValue(properties, 0, output, true);
        let userinput2 = UTILS.getPropertyValueAsString(properties, 1, "", true);
        let userinput3 = UTILS.getPropertyValue(properties, 2, "", false);
        let final = userinput + userinput2;
        world.addWorldVariable(userinput3, final);
        cb(final);
    },
    action_concat_variable : function(properties, output, cb, settings){
        let userinput = UTILS.getPropertyValue(properties,0, "", false);
        let userinput2 = UTILS.getPropertyValue(properties,1,  output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            world.concatWorldVariable(userinput, userinput2);
            cb(output);
        }
    },
    action_add_numbers_array : function(properties, output, cb){
        let current = 0;
        if(Array.isArray(output)){
            output.forEach(number=>{
                    current += parseFloat(number);
            })
        }
        cb(current);
    },
    action_add_numbers : function(properties, output, cb){
      cb(parseFloat(prev) + parseFloat(output));
    },
    action_if_else : function(properties, output, cb){
        let field1 = UTILS.getPropertyValue(properties, 0, output, true);
        let strOp = UTILS.getPropertyValue(properties,1 ,"", false);
        let comparison = UTILS.getPropertyValue(properties,2, "", true);
        let conpos = UTILS.getPropertyValue(properties, 3, "", true);
        let conneg = UTILS.getPropertyValue(properties, 4, "", true);
        let result = UTILS.compareByValue(field1, strOp, comparison);
        if(result){
            cb(conpos);
        }else{
            cb(conneg);
        }
    },
    action_left_trim: function(properties, output, cb){
        cb(output.replace(/^\s+/, ''));
    },
    action_right_trim:  function(properties, output, cb){
       cb(output.trimRight());
    },
    action_full_trim: function(properties, output, cb){
        cb(output.trim());
    },
    action_assign_variable : function(properties, output, cb){
        let varName = (properties[0].value) ? properties[0].value : "";
        let vvalue = (properties[1].value) ? world.parseForWorld(properties[1].value) : output;
        world.addWorldVariable(varName, vvalue);
        cb(output);
    },
    action_get_array_value : function(properties, output, cb){
        let index = (properties[0].value) ? properties[0].value : "";
        index = world.parseForWorld(index);
        let array_name = (properties[1].value) ? properties[1].value : null;
        if(array_name){
            let arr = world.parseForWorld(array_name);
            output = arr;
        }
        if(Array.isArray(output)){
            cb(output[index]);
        }else{
            cb("");
        }
    },
    action_random_number : function(properties, output, cb){
        let min = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        let max = (properties[1].value) ? world.parseForWorld(properties[1].value) : "";
        cb(Math.floor(Math.random() * (max - min + 1) + min));
    },
    subtract_two_numbers : function(properties, output, cb){
        let myoutput = 0;
        let numbers = (properties[0].value) ? properties[0].value : output;
        let variables = UTILS.getVariablesFromString(numbers,",", true);
        variables.forEach(vr=>{
            if(myoutput == 0){
                myoutput = vr;
            }else{
                myoutput = myoutput - vr;
            }
        })
        cb(myoutput);
    },
    action_to_lowercase : function(properties, output, cb){
        let text = UTILS.getPropertyValue(properties, 0, output, true);
        cb(text.toLowerCase());
    },
    action_to_uppercase : function(properties, output, cb){
        let text = UTILS.getPropertyValue(properties, 0, output, true);
        cb(text.toUpperCase());
    },
    action_multiply_two_numbers: function(properties, output, cb){
        let results = null;
        let userInput = (properties[0].value) ? properties[0].value : output;
        let numbers = UTILS.getVariablesFromString(userInput,",", true);
        results = numbers[0];
        numbers.forEach((num, i)=>{
            if(i!==0){
                results = results*num;
            }
        })
        cb(results);
    },
    action_divide_two_numbers : function(properties, output, cb){
        let results = null;
        let userInput = UTILS.getPropertyValue(properties, 0, output, false);
        let numbers = UTILS.getVariablesFromString(userInput,",", true);
        results = numbers[0];
        numbers.forEach((num,i)=>{
            if(i!==0){
                results = results/num;
            }
        });
        cb(results);
    },
    action_round_number : function(properties, output, cb){
        let num1 = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.round(num1));
    },
    action_read_file : function(properties, output, cb){
        let filePath = UTILS.getPropertyValue(properties, 0, output, true);
        if(isNull(filePath)){
           // logs.add("File path cannot be blank", settings);
        }
        var content = fs.readFileSync(filePath,  {encoding: 'utf8'});
        cb(content);
    },
    action_fetch_data : function (properties, output, cb, settings) {
        if(UTILS.propertiesValidation(settings,"0!=") === true){
            try{
                let response = "";
                let urlPath = UTILS.getPropertyValueAsString(properties, 0, "", true);
                let rType = UTILS.doesPropExists(properties, 1) ?? "text";
                let headers = UTILS.convertQueryToObject(UTILS.doesPropExists(properties, 2));
                if(urlPath){
                    if(rType == "json"){
                        fetch(urlPath, {headers: headers })
                            .then(response => response.json())
                            .then(data => cb(data));
                    }else{
                        fetch(urlPath,{headers: headers })
                            .then(response => response.text())
                            .then(data => cb(data));
                    }
                }else{
                    logs.sendErrorToConsole("No url path")
                }
            }catch (e){
                logs.sendErrorToConsole(e);
            }
        }
    },
    action_math_ceil : function(properties, output, cb){
        let num1 = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.round(num1));
    },
    action_string_left : function(properties, output, cb){
        let string = UTILS.getPropertyValue(properties, 0, output, true);
        let match = UTILS.getPropertyValue(properties, 1, "", true);
        cb(world.subStrAfterChars(string, match,'b'));
    },
    action_string_right : function(properties, output, cb){
        let string = UTILS.getPropertyValue(properties, 0, output, true);
        let match = UTILS.getPropertyValue(properties, 1, "", true);
        cb(world.subStrAfterChars(string, match,'a'));
    },
    action_string_length : function(properties, output, cb){
        let string = UTILS.getPropertyValue(properties, 0, output, true);
        cb(string.length);
    },

    /** Send Email Block
     * Default Block name: Send Email
     * Default Block icon: envelope
     * Package Name: Node Mailer
     * Package URL: https://nodemailer.com/about/
     * Package Version: 6.7.2
     *
     * **/

    action_send_email : function(properties, output, cb, settings){
        let connectionString = UTILS.getPropertyValue(properties, 0,"", true);
        let connectionObject = UTILS.convertQueryToObject(connectionString);
        let toString = UTILS.getPropertyValue(properties, 1,"", true);
        let subjectString = UTILS.getPropertyValue(properties, 2,"", true);
        let bodyString = UTILS.getPropertyValueAsString(properties, 3, output, true);
        let fromString = UTILS.getPropertyValue(properties, 4, "flowpro@no-reply.com", true);
        let attachmentString = UTILS.getPropertyValue(properties, 5, "", false);
        let attachments = UTILS.getVariablesFromString(attachmentString, ",", true);
        let attachmentObject = [];
        if(attachments.length > 0){
            attachments.forEach((userfile, i)=>{
                // check if file is valid as well
                if(userfile != null && userfile !== undefined && userfile != ""){
                    attachmentObject.push({
                        path: userfile
                    });
                }
            })
        }
        if(UTILS.propertiesValidation(settings,"0!=&1!=&2!=&3!=") === true){
            emailHandler.send({
                to: toString,
                subject : subjectString,
                text : UTILS.stripHtml(bodyString),
                from : fromString,
                html : bodyString,
                attachments: attachmentObject
            }, connectionObject, cb);
        }

    },
    action_matches_by_regex : function(properties, output, cb){
        let match = UTILS.getPropertyValue(properties, 0, output, true);
        let re = new RegExp(match);
        cb(output.match(re));
    },
    action_get_value_by_index : function(properties, output, cb){
        let index = UTILS.getPropertyValue(properties, 0, "", true);
        let ar = UTILS.getPropertyValue(properties, 1, output, true);
        if(Array.isArray(ar)){
           cb(ar[index]);
        }else{
            cb(output);
        }
    },
    action_get_value_by_key : function(properties, output, cb){
        let index = UTILS.getPropertyValue(properties, 0, 0, true);
        let ar = UTILS.getPropertyValue(properties, 1, output, true);
        try{
            if(typeof ar == "object"){
                cb(ar[index]);
            }
        }catch (e){
            logs.sendErrorToConsole(e);
        }
    },
    action_reverse_array : function(properties, output, cb){
        if(Array.isArray(output)){
            cb(output.reverse());
        }else{
            cb(output);
        }
    },
    action_if_null : function(properties, output, cb){
        let result = false;
        let userInput = UTILS.getPropertyValue(properties, 0, output, true);
        if(Array.isArray(userInput) && userInput.length <=0){
            result =  true;
        }else if(typeof userInput == "object" && Object.keys(userInput).length <=0){
            result = true;
        }else if(typeof userInput == "string" && userInput.length <=0){
            result = true;
        }else if(userInput == undefined || userInput == undefined){
            result = true;
        }
        cb(result);
    },
    action_if_not_null : function(properties, output, cb){
        let result = true;
        let userInput = UTILS.getPropertyValue(properties, 0, output, true);
        if(Array.isArray(userInput) && userInput.length <=0){
            result = false;
        }else if(typeof userInput == "object" && Object.keys(userInput).length <=0){
            result = false;
        }else if(typeof userInput == "string" && userInput.length <=0){
            result = false;
        }else if(userInput == undefined || userInput == undefined){
            result = false;
        }
        cb(result);
    },
    action_math_pow : function(properties, output, cb){
        let x = UTILS.getPropertyValue(properties, 0, output, true);
        let y = UTILS.getPropertyValue(properties, 1, "", true);
        cb(Math.pow(x, y));
    },
    action_sqr_root : function(properties, output, cb){
        let x = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.sqrt(x));
    },
    action_sin_cal : function(properties, output, cb){
        let x = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.sin(x));
    },
    action_cos_cal : function(properties, output, cb){
        let x = UTILS.getPropertyValue(properties, 0, output, true);
        cb(Math.cos(x));
    },
    action_pi_cal : function(properties, output, cb){
        cb(Math.PI);
    },
    action_wait_time : function(properties, output, cb){
        let time = UTILS.getPropertyValue(properties, 0, output, true);
        setTimeout(function(){
            cb(output);
        }, time);
    },
    action_write_to_file : function(properties, output, cb){
        let filePath = UTILS.getPropertyValueAsString(properties, 0, "", true);
        let type = UTILS.getPropertyValue(properties, 1, "overwrite", true);
        if(isNull(filePath)){

        }
        try {
            if(type == "overwrite"){
                fs.writeFileSync(filePath, output);
            }else{
                fs.appendFileSync(filePath, output + "\r\n");
            }
        } catch (error) {
            logs.logger.error(error);
        }
        cb(output);
    },
    action_filter_by_condition : function(properties, output, cb){
        let compare = (properties[0].value) ? world.parseForWorld(properties[0].value) : "";
        let condition = (properties[1].value) ? properties[1].value : "";
        let results = null;
        if(Array.isArray(output)){
            results = output.filter(val=>{
                cb(UTILS.compareByValue(val,condition, compare))
            })
        }else{
            cb(results);
        }
    },
    output_results : function(properties, output, cb){
        cb(output);
    },
    action_if_do : function(properties, output, cb){
        let ip1 = UTILS.getPropertyValue(properties, 0, output, true);
        let condition = UTILS.getPropertyValue(properties, 1, "", false);
        let ip2 = UTILS.getPropertyValue(properties, 2, "", true);
        cb(UTILS.compareByValue(ip1,condition, ip2));
    },
    action_increment_number : function(properties, output, cb){
        let ip1 = UTILS.getPropertyValue(properties, 0, output, true);
       cb(++ip1);
    },
    action_read_excel_as_array: async function(properties, output, cb, settings){
        let filename = UTILS.getPropertyValueAsString(properties, 0, output,true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            excelHandler.getRows(filename, function(results){
                cb(results);
            });
        }
    },
    action_split_by_line : function(properties, output, cb){
        try{
            cb(output.split("\n"));
        }catch (e){
            logs.logger.error(e);
            cb(output);
        }
    },
    action_math_constants : function(properties, output, cb){
        let results = "";
        let ip1 = (properties[0].value) ? properties[0].value : "";
        if(ip1 == "E"){
            results =  Math.E;
        }else if(ip1 == "LN2"){
            results = Math.LN2;
        }else if(ip1 == "LN10"){
            results = Math.LN10;
        }else if(ip1 == "LOG2E"){
            results = Math.LOG2E;
        }else if(ip1 == "PI"){
            results = Math.PI;
        }else if(ip1 == "SQRT1_2"){
            results = Math.SQRT1_2;
        }else if(ip1 == "SQRT2"){
            results = Math.SQRT2;
        }
       cb(results);
    },
    action_decrement_number : function(properties, output, cb){
        let ip1 = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        cb(--ip1);
    },
    action_to_string : function(properties, output, cb){
        let ip1 = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        try{
            if(typeof ip1 == "object"){
                cb(JSON.stringify(ip1));
            }else{
                cb(ip1.toString());
            }
        }catch (e){
            logs.logger.error(e);
        }
    },
    action_bulk_assignment : function(properties, output, cb){
        let ip1 = (properties[0].value) ? properties[0].value : output;
        if(isNull(ip1)){
          //  logs.add("Input cannot be null");
        }
        let params = UTILS.convertQueryToObject(ip1);
        world.bulkAssign(params);
        cb(output);
    },
    action_add_line_break : function(properties, output, cb){
        let ip1 = (properties[0].value) ? properties[0].value : output;
        cb(output + "\r\n");
    },
    action_create_p_element : function(properties, output, cb){
        let ip1 = UTILS.doesPropExists(properties, 0) ?? output;
        cb("<p>" + ip1 + "</p>");
    },
    action_run_mysql_query : function(properties, output, cb, settings){
        let connectionString = UTILS.getPropertyValue(properties, 0,"", true);
        let sqlQuery = UTILS.getPropertyValueAsString(properties, 1,"", true);
        let connectionObject = UTILS.convertQueryToObject(connectionString);
        connectionObject = UTILS.defaultSettings({host:"localhost", port:"3306"}, connectionObject);
        if(UTILS.propertiesValidation(settings,"1!=&0!=")){
            mysqlHandler.callBackQuery(connectionObject, sqlQuery, function(results){
                cb(results);
            });
        }
    },
    action_escaped_query: function(properties, output, cb, settings){
        let connectionString = UTILS.getPropertyValue(properties,0,"", true);
        let sqlQuery =  UTILS.getPropertyValueAsString(properties,1,"", true);
        let placeholders =  UTILS.getProperty(properties, 2, "");
        let connectionObject = UTILS.convertQueryToObject(connectionString);
        connectionObject = UTILS.defaultSettings({host:"localhost", port:"3306"}, connectionObject);
        let placeHolderArray = UTILS.getArrayValuesCheckWorld(placeholders.split(","));
        if(UTILS.propertiesValidation(settings, "1!=&0!=") === true){
            mysqlHandler.escapedQuery(connectionObject, sqlQuery, placeHolderArray, function(results){
                cb(results);
            });
        }
    },
    action_tsql_query : function(properties, output, cb, settings){
        let connectionString = UTILS.getPropertyValue(properties,0,"", true);
        let sqlQuery =  UTILS.getPropertyValueAsString(properties,1,"", true);
        mysqlHandler.tsqlQuery(connectionString, sqlQuery, function(results){
            cb(results);
        });
    },
    action_tsql_object_query : function(properties, output, cb, settings){
        let connectionString = UTILS.getPropertyValue(properties,0,"", true);
        let sqlQuery =  UTILS.getPropertyValueAsString(properties,1,"", true);
        mysqlHandler.tsqlQuery(connectionString, sqlQuery, function(results){
            cb(results);
        });
    },
    action_basic_command : function(properties, output, cb, settings){
        if(UTILS.propertiesValidation(settings, "0!=") === true){
            let commandString = UTILS.getPropertyValueAsString(properties,0, output, true);
            commandHandler.run(commandString, function(results, error){
                if(results){
                    cb(results);
                }else{
                    logs.sendToConsole(error);
                }
            });
        }
    },
    action_parse_xml_from_file : function(properties, output, cb, settings){
        let ip1 = UTILS.getPropertyValueAsString(properties, 0, "", true);
        let data = fs.readFileSync(ip1).toString("utf-8");
        if(UTILS.propertiesValidation(settings,"0!=")){
            xmlHandler.parse(data, {}, function(results){
                cb(results);
            });
        }
    },
    action_parse_xml_from_output : function(properties, output, cb){
        let ip1 = (properties[0].value) ? world.parseForWorld(properties[0].value) : output;
        xmlHandler.parse(ip1, {}, function(results){
            cb(results);
        });
    },
    action_print_output : function(properties, output, cb){
        cb(output);
    },
    action_create_html_table: function(properties, output, cb){
        let headers = UTILS.getPropertyValue(properties, 0, "");
        let headerArray = UTILS.convertStringToArray(headers,",", true);
        let data = UTILS.getPropertyValue(properties, 1, output, true);
        let type = UTILS.getPropertyValue(properties, 2,"object");
        let viewId = UTILS.getPropertyValue(properties, 3,null, false);
        let results = "<table id='fp-data-table' class='table-responsive table'>";
        if(headerArray.length >= 1){
            results += '<thead><tr>';
            headerArray.forEach(headerText => {
                results += `<td>${headerText}</td>`;
            });
            results += '</tr></thead>';
        }
        results += '<tbody>';
        if(type == "array"){
            if(typeof data == "array"){
                data.forEach(row=>{
                    results += '<tr>';
                    row.forEach(rw=>{
                        results += `<td>${rw}</td>`;
                    });
                    results += '</tr>';
                })
            }
        }else{
            data.forEach(row=>{
                if(typeof data == "object"){
                    results += '<tr>';
                    Object.values(row).forEach(text => {
                        results += `<td>${text}</td>`;
                    })
                    results += '</tr>';
                }
            })
        }
        results += "</tbody>";
        results += "</table>";
        if(viewId){
            document.getElementById("3432343" + viewId).innerHTML = results;
            new JSTable("#fp-data-table");
        }
        if(viewId){
            cb(output);
        }else{
            cb(results);
        }
    },
    action_show_notification: function(properties, output, cb, settings){
        let message = UTILS.getPropertyValueAsString(properties, 0, output, true);
        let messageType = UTILS.getPropertyValue(properties, 1, "success",false);
        if(UTILS.propertiesValidation(settings,"0!=")){
            if(messageType == "success"){
                logs.sendToConsole("SUCCESS: " + message);
            }else if(messageType == "error"){
                logs.sendToConsole("ERROR: " + message);
            }else if(messageType == "info"){
                logs.sendToConsole("INFO: " + message);
            }else if(messageType == "warning"){
                logs.sendToConsole("WARNING: " + message);
            }
            cb(output);
        }
    },
    action_join_strings : function(properties, output, cb, settings){
        let message = UTILS.getPropertyValue(properties, 0, "", false);
        let results = "";
        if(UTILS.propertiesValidation(settings, "0!=")){
            let options = UTILS.getArrayValuesCheckWorld(UTILS.convertStringToArray(message,",", false));
            options.forEach(item=>{
                results += item;
            });
            cb(results);
        }
    },
    action_create_object_from_string : function(properties, output, cb){
        let userInput = (properties[0].value) ? properties[0].value : "";
        let varToAssign = UTILS.getPropertyValue(properties, 1, "", false);
        if(userInput){
            let obj = UTILS.getQueryStringParseWorld(userInput);
            if(varToAssign){
                world.addWorldVariable(varToAssign, obj);
            }
            cb(obj);
        }else{
            logs.sendErrorToConsole("No user input found");
            cb(output);
        }
    },
    action_get_time_now : function(properties, output, cb){
        cb(moment().format('YYYY-MM-DD HH:mm:ss'));
    },
    action_template_string : function(properties, output, cb){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        let assignTo = UTILS.getPropertyValue(properties,1,"", false);
        if(assignTo){
            world.addWorldVariable(assignTo, userInput);
        }
        cb(userInput);
    },
    action_post_data: function(properties, output, cb, settings){
        let url = UTILS.getPropertyValueAsString(properties, 0, output, true);
        let userInput = UTILS.getPropertyValue(properties,1, "", false);
        let headers = UTILS.convertQueryToObject(UTILS.doesPropExists(properties, 3));
        let postValues = UTILS.getQueryStringParseWorld(userInput);
        let rType = UTILS.getPropertyValue(properties, 2, "text", false);
        let files = UTILS.convertQueryToObject(UTILS.getPropertyValue(properties, 4, "", true));
        let formData = new FormData();
        if(UTILS.propertiesValidation(settings, "0!=&1!=")){
            Object.keys(postValues).forEach(key=>{
                formData.append(key, postValues[key]);
            })
            Object.keys(files).forEach(key=>{
                   // let buf = fs.readFileSync(files[key]);
                    //let filename = path.basename(files[key]);
                 //   formData.append(key, buf, {filename});
            });
            // request options
            const options = {
                method: 'POST',
                body: formData,
                headers:headers
            }
            if(rType == "text"){
                fetch(url, options)
                    .then(res => res.text())
                    .then(
                        res =>cb(res)
                    );
            }else{
                fetch(url, options)
                    .then(res => res.json())
                    .then(
                        res =>cb(res)
                    );
            }
        }
    },
    action_object_bulk_assignment : function(properties, output, cb){
        let current = UTILS.getPropertyValue(properties, 0, output, true);
        if(typeof current == "object"){
            let userInput = UTILS.getPropertyValue(properties, 1, "", false);
            let variables = UTILS.convertQueryToObject(userInput);
            Object.keys(variables).forEach(okey=>{
                world.addWorldVariable(variables[okey], current[okey]);
            });
            cb(output);
        }else if(Array.isArray(current)){
            let userInput = UTILS.getPropertyValue(properties, 1, "", false);
            let variables = UTILS.convertQueryToObject(userInput);
            Object.keys(variables).forEach(okey=>{
                world.addWorldVariable(variables[okey], current[okey]);
            });
        }else{
            logs.sendToConsole("Value is not object");
            cb(output);
        }
    },
    action_create_array : function(properties, output, cb){
        let proName = UTILS.getPropertyValue(properties, 0, "",false);
        if(proName){
            world.addWorldVariable(proName, []);
        }else{
            logs.sendErrorToConsole("No variable name set");
        }
        cb(output);
    },
    action_push_to_array : function(properties, output, cb){
        let myArray = UTILS.getPropertyValue(properties, 0, [],true);
        let item = UTILS.getPropertyValue(properties, 1, "", true);
        let assignTo = UTILS.getPropertyValue(properties, 2, "", false);
        if(Array.isArray(myArray)){
            myArray.push(item);
            if(assignTo){
                world.addWorldVariable(assignTo, myArray);
            }
        }else{
            logs.sendErrorToConsole("Variable is not of type array")
        }
        if(!myArray || !item){
            logs.sendErrorToConsole("Array Name and item not added");
        }
        cb(output);

    },
    action_modulus_numbers : function(properties, output, cb){
        let num1 = UTILS.getPropertyValue(properties, 0, "", true);
        let num2 = UTILS.getPropertyValue(properties, 1, "", true);
        if(num1 && num2){
            cb(num1%num2);
        }else{
            cb(output);
        }
    },
    action_push_to_object : function(properties, output, cb){
        let myObject = UTILS.getPropertyValue(properties, 0, output, true);
        let myValues = UTILS.getPropertyValue(properties, 1, "", true);
        let obj = UTILS.getQueryStringParseWorld(myValues);
        let myAssignment = UTILS.getPropertyValue(properties, 2, "", false);
        let finalObj = Object.assign(myObject, obj);
        if(myAssignment){
            world.addWorldVariable(myAssignment, finalObj);
        }
        cb(finalObj);
    },
    action_build_clear_form : function(properties, output, cb){
        document.dispatchEvent(new CustomEvent("engine.clearform", {}));
        cb(output);
    },
    action_echo_message : function(properties, output, cb){
        let message = UTILS.getPropertyValueAsString(properties, 0, "", true);
        logs.sendToConsole(message);
        cb(output);
    },
    action_save_to_excel : function(properties, output, cb, settings){
        let excelHeaders = UTILS.convertQueryToObject(UTILS.getPropertyValue(properties, 0, "", false),",",true);
        let excelRows = UTILS.getPropertyValue(properties,1, output, true);
        if(UTILS.propertiesValidation(settings, "2!=") === true){
            let excelFileName = UTILS.getPropertyValueAsString(properties, 2, "", true);
            let formatHeaders = [];
            Object.keys(excelHeaders).forEach(key=>{
                formatHeaders.push({
                    label: excelHeaders[key],
                    value: key
                })
            });
            excelHandler.saveToExcel(excelFileName,formatHeaders, excelRows);
            cb(output);
        }
    },
    action_if_world_exists : function(properties, output, cb){
        let varName = UTILS.getPropertyValue(properties, 0, "", false);
        varName = varName.replaceAll("$","");
        let results = world.getWorldVariable(varName);
        cb(!!(results));
    },
    action_get_object_length : function(properties, output, cb){
        let val = UTILS.getPropertyValue(properties, 0, output, true);
        if(Array.isArray(val)){
            cb(val.length);
        }else if(typeof val =="object"){
            cb(Object.keys(val).length);
        }
    },
    action_create_simple_html_table : function(properties, output, cb){
        let headers = UTILS.getPropertyValue(properties, 0, "", true);
        let headersHtml = UTILS.convertStringToArray(headers,',', true);
        let tableBody = UTILS.getPropertyValue(properties,1, output, true);
        let content = "<table>";
        content += "<thead><tr>";
        headersHtml.forEach(title=>{
            content += `<td>${title}</td>`;
        })
        content += "</tr></thead>";
        content += "<tbody>";
        content += tableBody + "</tbody>";
        content += "</table>";
        cb(content);
    },
    action_create_image_listview_widget : function(properties, output, cb){
        let imageLink = UTILS.getPropertyValue(properties, 0, "", true);
        let listTitle = UTILS.getPropertyValueAsString(properties, 1, "", true);
        let listBody = UTILS.getPropertyValueAsString(properties, 2, output, true);
        let content = `<ul class="widget-listview">`;
        content += ` <li>
            <img src="${imageLink}">
            <div class="wl-body">
                <span class="wg-header">${listTitle}</span><br>
                <span class="wg-bdy">${listBody}</span>
            </div>
        </li></ul>`;
        cb(content);

    },
    action_read_files_to_array : function(properties, output, cb, settings){
        let sitesList = [];
        let dirPath = UTILS.getPropertyValueAsString(properties,0,"", true);
        if(UTILS.propertiesValidation(settings,"0!=")){
            fs.readdirSync(dirPath).forEach(function(file) {
                let trueFile = path.join(dirPath, file);
                if(!fs.statSync(trueFile).isDirectory()){
                    sitesList.push(trueFile);
                }
            });
            cb(sitesList);
        }
    },
    action_if_multiple : function(properties, output, cb, settings){
        let conditionString = UTILS.getPropertyValue(properties, 0, "", false);
        if(UTILS.propertiesValidation(settings, "0!=")){
            let results = UTILS.blockValidation(conditionString, settings, false);
            cb(results);
        }
    },
    action_read_files_as_string : function(properties, output, cb, settings){
        let filePath = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            fs.readFile(filePath, 'utf8', function (err,data) {
                if (err) {
                   logs.sendErrorToConsole(err);
                }
                cb(data);
            });
        }
    },
    action_pipe_output : function(properties, output, cb, settings){
        let updatedOutput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        cb(updatedOutput);
    },
    action_parse_date : function(properties, output, cb, settings){
        let userDate = UTILS.getPropertyValue(properties, 0, output, true);
        let userFormat = UTILS.getPropertyValue(properties, 1, "", false);
        let userFormat2 = UTILS.getPropertyValue(properties, 2, "", false);
        if(UTILS.propertiesValidation(settings, "1!=&2!=")){
            let dt = moment(userDate, userFormat);
            cb(dt.format(userFormat2));
        }
    },
    action_parse_markdown : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValue(properties, 0, output, true);
        let html = markdown.toHTML( userInput );
        if(UTILS.propertiesValidation(settings, "0!=")){
            cb(html);
        }
    },
    action_file_base_name : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            let basename = path.basename(userInput);
            cb(basename);
        }
    },
    action_file_exists_check : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            cb(fs.existsSync(userInput))
        }
    },
    action_file_is_file : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            let results = fs.statSync(userInput);
            cb(results.isFile())
        }
    },
    action_file_is_directory : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            let results = fs.statSync(userInput);
            cb(results.isDirectory());
        }
    },
    action_file_get_attributes : function(properties, output, cb, settings){
        let userInput = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(UTILS.propertiesValidation(settings, "0!=")){
            let results = fs.statSync(userInput);
            cb(results);
        }
    },

    /** FTP LIST
     *
     * @param properties
     * @param output
     * @param cb
     * @param settings
     */
    action_ftp_list : function(properties, output, cb, settings){
        let userSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let remotePath = UTILS.getPropertyValueAsString(properties, 1, output, true);
        let settingsObject = UTILS.convertQueryToObject(userSettings);
        if(UTILS.propertiesValidation(settings,"0!=&1!=")){
            ftpHandler.ftpList(settingsObject,remotePath, function(results){
                cb(results);
            })
        }
    },

    /**
     * FTP Download
     * @param properties
     * @param output
     * @param cb
     * @param settings
     */
    action_ftp_download : function(properties, output, cb, settings){
        let userSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let fileToDownload = UTILS.getPropertyValueAsString(properties, 1, output, true);
        let localPath = UTILS.getPropertyValueAsString(properties, 2, "", true);
        let settingsObject = UTILS.convertQueryToObject(userSettings);
        if(UTILS.propertiesValidation(settings,"0!=&2!=")){
            ftpHandler.ftpDownload(settingsObject, fileToDownload,localPath, function(results){
                cb(results);
            })
        }
    },
    action_ftp_upload : function(properties, output, cb, settings){
        let userSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let userFile = UTILS.getPropertyValueAsString(properties, 1, output, true);
        let uploadPath = UTILS.getPropertyValueAsString(properties, 2, "", true);
        let fileName = path.basename(userFile);
        let uploadFullPath = uploadPath +  fileName;
        let settingsObject = UTILS.convertQueryToObject(userSettings);
        if(UTILS.propertiesValidation(settings,"0!=&2!=")){
            ftpHandler.uploadFile(settingsObject, userFile,uploadFullPath, function(results){
                cb(results);
            })
        }
    },
    /**
     * Documentation https://www.npmjs.com/package/ssh2-sftp-client#sec-5-2-6
     * @param properties
     * @param output
     * @param cb
     * @param settings
     */
    action_sftp_list : function(properties, output, cb, settings){
        let connSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let connObject = UTILS.convertQueryToObject(connSettings);
        let homePath = UTILS.getPropertyValueAsString(properties, 1, output, true);
        if(UTILS.propertiesValidation(settings,"0!=")){
            ftpHandler.sftpList(connObject, homePath, cb);
        }
    },
    action_sftp_download_file : function(properties, output, cb, settings){
        let connSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let connObject = UTILS.convertQueryToObject(connSettings);
        let downloadPath = UTILS.getPropertyValueAsString(properties, 1, output, true);
        let filePath = UTILS.getPropertyValueAsString(properties, 2, output, true);
        let filename = path.basename(downloadPath);
        let finalLocalPath = path.join(filePath, filename);
        if(UTILS.propertiesValidation(settings,"0!=")){
            ftpHandler.sftpDownload(connObject, downloadPath, finalLocalPath, cb);
        }
    },
    action_sftp_upload_file : function(properties, output, cb, settings){
        let connSettings = UTILS.getPropertyValue(properties, 0, "", true);
        let connObject = UTILS.convertQueryToObject(connSettings);
        let localFile = UTILS.getPropertyValueAsString(properties, 1, output, true);
        let filename = path.basename(localFile);
        let remotePath = UTILS.getPropertyValueAsString(properties, 2, output, true);
        let remoteFile = remotePath + filename;
        if(UTILS.propertiesValidation(settings,"0!=&1!=")){
            ftpHandler.sftpUpload(connObject, remoteFile, localFile, cb);
        }
    },
    action_file_copy : function(properties, output, cb, settings){
        let srcFile = UTILS.getPropertyValueAsString(properties, 0, output, true);
        let destFile = UTILS.getPropertyValueAsString(properties, 1, "", true);
        if(UTILS.propertiesValidation(settings, "0!=&1!=")){
            fs.copyFileSync(srcFile, destFile);
            cb(destFile);
        }
    },
    action_file_move : function(properties, output, cb, settings){
        let srcFile = UTILS.getPropertyValueAsString(properties, 0, output, true);
        let destFile = UTILS.getPropertyValueAsString(properties, 1, "", true);
        if(UTILS.propertiesValidation(settings, "0!=&1!=")){
            mv(srcFile, destFile, function(err) {
                if (err) {
                    logs.sendErrorToConsole(err);
                } else {
                    cb(destFile);
                }
            });
        }
    },
    action_generate_date_id : function(properties, output, cb, settings){
        cb(Date.now());
    },
    action_generate_string_id : function(properties, output, cb, settings){
        let max = UTILS.getPropertyValue(properties, 0, 12, true);
        let ID = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for ( let i = 0; i < max; i++ ) {
            ID += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        cb(ID);
    },
    action_open_a_file : function(properties, output, cb, settings){
        let filePath = UTILS.getPropertyValueAsString(properties, 0, output, true);
        open(filePath);
        cb(filePath);
    },
    /** TODO:  Sound lenght is short when played **/
    action_play_a_sound :function(properties, output, cb, settings){
        let filePath = UTILS.getPropertyValueAsString(properties, 0, output, true);
        if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
            sound.play(filePath).then((response) =>
                cb(output)
            );
        }
    },
    action_string_contains : function(properties, output, cb, settings){
        let valueToCompare = UTILS.getPropertyValue(properties, 0, output, true);
        let comparision = UTILS.getPropertyValue(properties, 1, "", true);
        let results = valueToCompare.includes(comparision);
        cb(results);
    },
    action_create_folder : function(properties, output, cb, settings){
        let dirToCreate = UTILS.getPropertyValueAsString(properties, 0, output, true);
        fs.access(dirToCreate, (error) => {
            if (error) {
                fs.mkdir(dirToCreate, (error) => {
                    if (error) {
                        logs.sendErrorToConsole(error);
                    } else {
                        logs.sendToConsole(`Directory created: ${dirToCreate}`)
                        cb(output);
                    }
                });
            } else {
                logs.sendErrorToConsole("Given Directory already exists !!");
                // continue after error
                cb(output);
            }
        });
    },
    action_parse_string : function(properties, output, cb, settings){
        let stringToParse = UTILS.getPropertyValue(properties, 0, output, true);
        try{
            let ob = JSON.parse(stringToParse);
            cb(ob);
        }catch (e){
            logs.sendErrorToConsole(e);
           // cb(output);
        }
    },
    action_sqlite_query : function(properties, output, cb, settings){
        let dbPath = UTILS.getPropertyValueAsString(properties, 0, "", true);
        let sqlQuery = UTILS.getPropertyValueAsString(properties, 1, output, true);
        mysqlHandler.sqlite(dbPath,"", sqlQuery, function(results){
            cb(results);
        });
    },
    action_pretty_print : function(properties, output, cb, settings){
        let toFormat = UTILS.getPropertyValue(properties, 0, output, true);
        const html = extraModsHandler.convertToHTML(toFormat);
        cb(html);
    },
    action_download_file: function(properties, output, cb, settings){
        let fileUri = UTILS.getPropertyValue(properties, 0, output, true);
        let saveLocation =  UTILS.getPropertyValue(properties, 1, "", true);
        let savePath = path.join(saveLocation, path.basename(fileUri));
        let options = {headers:{'Cache-Control':'no-cache'}}
        https.get(fileUri, options, (res) => {
            let file = fs.createWriteStream(savePath);
            res.pipe(file);
            file.on('finish', () => {
                cb("File saved to" + savePath);
                file.close();
            });

        }).on("error", (err) => {
           // console.log("Error: ", err.message);
        });
    }

}