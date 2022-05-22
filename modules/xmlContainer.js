const {XMLParser} = require('fast-xml-parser');

function parseXml(xmlDataStr, settings, cb) {
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    };
    const parser = new XMLParser(options);
    let results = parser.parse(xmlDataStr);
    cb(results);
}


module.exports = {
    parse: parseXml
}