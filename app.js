const request = require('request');
const iconv  = require('iconv-lite');
const jsdom = require('jsdom');
const fs = require('fs');

const { JSDOM } = jsdom;

async  function get_document(url, success) {
    request.get({
        url: url,
        encoding: null,
        headers: {
            'User-Agent': 'ReshakParser'
        }
    }, (err, res, body) => {
        if (err)  return console.log(err);
        var dom = new JSDOM(iconv.decode(body, 'cp1251'));
        document = dom.window.document;
        success(document);
    });
}

