const path = require("path");


function addToConsole(message){
    console.log("NOTICE: " + message);
}


module.exports = {
    sendToConsole: addToConsole,
    sendErrorToConsole: function(message){
        addToConsole("ERROR: " + message);
    }
}
