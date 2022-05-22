/**
 * Node Mailer
 * https://nodemailer.com/about/
 */

const utils = require("../helpers/utils");
const logs = require("../helpers/logs");

const nodemailer = utils.requireIfExists("nodemailer"); //require("nodemailer");

let messageOptions = {
    from: 'flowpro@no-reply.com',
    to: "",
    subject: "",
    text: "",
    html : "",
    issecure: false,
}

let transportOptions = {
    host: "",
    port: 25,
    secure: false,
    authMethod : "",
    auth: {
        user: "",
        pass: ""
    },
    ignoreTLS :  "",
    requireTLS : "",
    tls : {
        rejectUnauthorized : false
    },
    'tls.servername' : '',

}



function sendMail(messageObject, settings, cb){
    const message = Object.assign({}, messageOptions, messageObject);

    let buildMessage = {
        from : (message.from != "") ? message.from : "flowpro@no-reply.com",
        to : message.to,
        subject: message.subject,
        text : message.text,
        html : message.html
    }
    if(message.attachments.length > 0){
        buildMessage["attachments"] = message.attachments;
    }

    let transportSettings = {
        host: settings.host,
        port: settings.port,
        secure: false,
        auth: {
            user: settings.user,
            pass: settings.password
        },
    }
    const ts = Object.assign({}, transportOptions, transportSettings);

    if(settings.tsl_rejectUnauthorized){
        ts.tsl.rejectUnauthorized = settings.tsl_rejectUnauthorized;
    }
    if(settings.ignoretls){
        ts.ignoreTLS = settings.ignoretls;
    }
    if(settings.requiretls){
        ts.requireTLS  = settings.requiretls;
    }
    if(settings.secure){
        ts.secure = settings.secure;
    }

    let transport = nodemailer.createTransport(ts);
    transport.sendMail(buildMessage,function(error, info){
        if(error){
            logs.sendErrorToConsole(error);
        }else{
            // return message body
            cb(messageObject.html);
        }
    });
}

module.exports = {
    send : sendMail
}