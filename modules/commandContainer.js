const utils = require("../helpers/utils");

const cmd= utils.requireIfExists('node-cmd'); //require('node-cmd');

function runCommand(command, cb){
    cmd.run(command,
        function(err, data, stderr){
            if(err){
                cb("", err);
            }else{
                cb(data);
            }
        }
    );
}

module.exports =  {
    run : runCommand
}