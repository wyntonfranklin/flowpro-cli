const path = require("path");


function addToConsole(message){
    console.log(message);
}


module.exports = {
    sendToConsole: addToConsole,
    sendErrorToConsole: function(message){
        addToConsole("ERROR: " + message);
    }
}
