const rp = require("request-promise").defaults({ encoding: 'latin1' });
const cheerio = require('cheerio');
const iconv = require("iconv-lite");



function getMenu(url) {
    return new Promise(async (resolve, reject) => {
        var options = {
            headers: {
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'referer': 'https://reshak.ru/reshebniki/',
                'Accept-Encoding': "*"
            },
            transform(body) {
                return cheerio.load(iconv.encode(iconv.decode(new Buffer(body,'binary'),'win1251'),'utf8'))
            },
        };
        options.uri = url;
        await rp(options)
            .then(($) => {
               let hrefElemets= $('.tablemenu  a');
               let href = [];
               for (let i = 1; i<hrefElemets.length-1; i++){
                   href.push(hrefElemets.eq(i).attr("href"))
               }

            })
            .catch((err) => {
                console.log("возникла ошибка: ", err);
                reject();
            });
    });
}
getMenu('https://reshak.ru');