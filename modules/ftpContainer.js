const utils = require("../helpers/utils");
const logs = require("../helpers/logs");

const Client = utils.requireIfExists('ftp'); //require('ftp');
const sshClient = utils.requireIfExists('ssh2-sftp-client'); //require('ssh2-sftp-client');
var fs = require('fs');

let defaultSftpOptions =  {
    host: 'localhost', // string Hostname or IP of server.
    port: 22, // Port number of the server.
    forceIPv4: false, // boolean (optional) Only connect via IPv4 address
    forceIPv6: false, // boolean (optional) Only connect via IPv6 address
    username: '', // string Username for authentication.
    password: '', // string Password for password-based user authentication
    agent: process.env.SSH_AGENT, // string - Path to ssh-agent's UNIX socket
    privateKey: '', // Buffer or string that contains
    passphrase: '', // string - For an encrypted private key
    readyTimeout: 20000, // integer How long (in ms) to wait for the SSH handshake
    strictVendor: true, // boolean - Performs a strict server vendor check
    retries: 2, // integer. Number of times to retry connecting
    retry_factor: 2, // integer. Time factor used to calculate time between retries
    retry_minTimeout: 2000
}

function getSftpConnectionSettings(connSettings){
    let settingsObject = Object.assign({}, defaultSftpOptions,{
        host: connSettings.host,
        username: connSettings.username,
        password: connSettings.password,
        port: connSettings.port ? connSettings.port : 22
    })
    return settingsObject;
}

function sftpList(connSettings, remotePath, cb){
    let sftp = new sshClient();
    let settingsObject = getSftpConnectionSettings(connSettings);
    sftp.connect(settingsObject).then(() => {
        return sftp.list(remotePath);
    }).then(data => {
        cb(data);
    }).catch(err => {
        logs.sendErrorToConsole(err);
    });
}

function sftpDownload(connSettings, remoteFile, localPath, cb){
    let sftp = new sshClient();
    let dst = fs.createWriteStream(localPath);
    let settingsObject = getSftpConnectionSettings(connSettings);
    sftp.connect(settingsObject).then(() => {
        return sftp.get(remoteFile, dst)
    }).then(data => {
        cb(localPath);
        sftp.end();
    }).catch(err => {
        logs.sendErrorToConsole(err);
    });
}

function sftpUpload(connSettings, remoteFile, localPath, cb){
    let sftp = new sshClient();
    let data = fs.createReadStream(localPath);
    let settingsObject = getSftpConnectionSettings(connSettings);
    sftp.connect(settingsObject).then(() => {
        return sftp.put(data, remoteFile);
    }).then(()=> {
        cb(remoteFile);
        sftp.end();
    }).catch(err => {
        logs.sendErrorToConsole(err);
    });
}


function uploadFile(settings, file, remote, cb){
    let options = settings;
    let conn = new Client();
    conn.on("ready", function(){
        conn.put(file, remote, function(err) {
            if(err) {
                logs.sendErrorToConsole(err);
            }
            cb(remote);
            conn.end();
        });
    })
    conn.connect(options);
}

function ftpDownloadFile(settings, file, local, cb){
    let options = settings;
    let conn = new Client();
    conn.on("ready", function(){
        conn.get(file, function(err, stream) {
            if(err) {
                logs.sendErrorToConsole(err);
            }
            stream.once('close', function() {
                conn.end();
                cb(local);
            });
            stream.pipe(fs.createWriteStream(local));
        });
    })
    conn.connect(options);
}

function ftpListDir(settings, remotePath, cb){
    let options = settings;
    let conn = new Client();
    conn.on("ready", function(){
        conn.list(remotePath,function(err, list) {
            if (err) throw err;
            cb(list);
            conn.end();
        });
    })
    conn.connect(options);
}


module.exports =  {
    uploadFile : uploadFile,
    ftpDownload: ftpDownloadFile,
    ftpList : ftpListDir,
    sftpList : sftpList,
    sftpDownload : sftpDownload,
    sftpUpload : sftpUpload
}