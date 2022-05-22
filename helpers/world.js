const logs = require("../helpers/logs");
let worldVariables = { };
let localVariables = {};
let worldInUse = true;

let reserveredWords = ['cword','cindex', 'coutput','_homedir_','_basedir_'];

module.exports = {
    getWorld: function(){
      return worldVariables;
    },
    setToLocal : function(){
        worldInUse = false;
        localVariables = {};
    },
    setToWorld : function (){
        worldInUse = true;
    },
    getCurrentVariableScope : function(){
        return worldVariables;
    },
    clear : function(){
      worldVariables = {};

    },
    getWorldVariable : function(value){
        if(this.getCurrentVariableScope().hasOwnProperty(value)){
            return this.getCurrentVariableScope()[value];
        }
        return null;
    },
    variableExists: function(value){
        if(value == "" || value == null || value == undefined){
            return false;
        }
        if(this.getCurrentVariableScope().hasOwnProperty(value)){
            return true;
        }
        return false;
    },
    addWorldVariable : function(key, value){
        if(reserveredWords.indexOf(key) != -1) {
            logs.sendToConsole(`cannot assign (${key}). This is a reserved word.`);
        }else{
            this.getCurrentVariableScope()[key] = value;
        }
    },
    addPrivateWorldVariable: function(key, value){
        this.getCurrentVariableScope()[key] = value;
    },
    concatWorldVariable : function(key, value){
        let prevValue = this.getCurrentVariableScope()[key];
        console.log(prevValue);
        if(prevValue == undefined){
            prevValue = "";
        }
        let finalValue = prevValue + value;
        this.addWorldVariable(key,finalValue);
    },
    subStrAfterChars : function(str, char, pos){
        if(pos=='b')
            return str.substring(0, str.indexOf(char));
        else if(pos=='a')
            return str.substring(str.indexOf(char) + 1);
        else
            return str;
    },
    bulkAssign : function(object){
        for (const key in object) {
            let name = key;
            let value = this.parseForWorld(object[key]);
            this.addWorldVariable(name, value);
        }
    },
    parseForWorld: function(value){
        if(this.variableExists(value)){
            return this.getWorldVariable(value);
        }else{
            return value;
        }
    },
}