const utils = require("../helpers/utils");
const logs = require("../helpers/logs");

const mysql = utils.requireIfExists('mysql');
const tsql = utils.requireIfExists('mssql'); //require('mssql');
const sqlite3 = utils.requireIfExists('sqlite3'); //require("sqlite3");
const sqlite = utils.requireIfExists('sqlite'); //require("sqlite");

//const {set} = require("../helpers/settingsManager");


let mysqlConnectionSettings = {
    host: 'localhost',
    user : '',
    password: '',
    flags : '',
    database: '',
    host: 3306,
    charset: '',
    timezone : '',
    connectTimeout : '',
    insecureAuth : '',
    dateStrings : true,
    ssl  : {
        ca : '',
        rejectUnauthorized: true
    }
}

function sqlLiteQuery(dbPath, queryType, query, cb){
    if(sqlite){
        sqlite.open({
            filename: dbPath,
            driver: sqlite3.Database
        }).then((db) => {
            db.all(query).then((result)=>{
                cb(result);
            })
        })
    }else{
        logs.sendErrorToConsole("Module not installed");
    }
}


function tRunQuery(connString, query, cb){
    if(tsql){
        try {
            // make sure that any items are correctly URL encoded in the connection string
            tsql.connect(connString).then(r => {
                tsql.query(query).then(results=>{
                    cb(results)
                });
            })
        } catch (err) {
            cb(err);
        }
    }else{
        logs.sendErrorToConsole("MSSQL module not installed")
    }
}

function createMySQLConnection(settings){
    let conobj = Object.assign({}, mysqlConnectionSettings,{
        host     : (settings.host) ? settings.host : "",
        user     : (settings.user) ? settings.user : "",
        password : (settings.password) ? settings.password : "",
        database : (settings.database) ? settings.database : "",
        port : (settings.port) ? settings.port : "",
        flags :  (settings.flags) ? settings.flags : "",
        charset : (settings.charset) ? settings.charset : "",
        timezone : (settings.timezone) ? settings.timezone : "",
        connectTimeout : (settings.connectTimeout) ? settings.connectTimeout : "",
        insecureAuth : (settings.insecureAuth ) ? settings.insecureAuth  : "",
        dateStrings : (settings.dateStrings ) ? settings.dateStrings  : "",
    });

    // ssl_ca - the file path of the certificate
    if(settings.ssl_ca){

        conobj.ssl.ca = settings.ssl_ca;

        // ssl_rejectunauth -  a boolean allow you to not reject ssl
        if(settings.ssl_rejectunauth){
            conobj.ssl.rejectUnauthorized = ssl_rejectunauth
        }
    }else{
        // remove ssl setting if not active
        delete conobj["ssl"];
    }

    if(mysql){
        let connection = mysql.createConnection(conobj);

        return connection;
    }{
        logs.sendErrorToConsole("MYSQL not installed")
        return null;
    }
}

function runQuery(settings, query, cb){
    let connection = createMySQLConnection(settings);
    if(connection){
        connection.query(query, function(error, results, fields){
            if(error){
                logs.sendErrorToConsole(error);
            }
            cb(results);
        });
    }
}

function runEscapedQuery(settings, query, params, cb){
    let connection = createMySQLConnection(settings);
    if(connection){
        connection.query(query, params, function(error, results, fields){
            if(error){
                logs.sendErrorToConsole(error);
            }
            cb(results);
        });
    }
}

module.exports = {
    callBackQuery : runQuery,
    escapedQuery : runEscapedQuery,
    tsqlQuery : tRunQuery, // have to test
    sqlite : sqlLiteQuery
}