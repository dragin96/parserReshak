const rp = require("request-promise").defaults({ encoding: 'latin1' });
const cheerio = require('cheerio');


function getMenu(url, selector) {
    return new Promise(async (resolve, reject) => {
        let options = {
            headers: {
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                'referer': 'https://reshak.info/',
                'Accept-Encoding': "*"
            },
            transform(body) {
                return cheerio.load(body);
            },
        };
        options.uri = url;
        await rp(options)
            .then(($) => {
               let hrefElemets= $(selector);
               let hrefs = [];
               for (let i = 0; i<hrefElemets.length; i++){
                   href = hrefElemets.eq(i).attr("href");
                   if(href !== '/'){
                       hrefs.push(href)
                   }
               }
               console.log(hrefs);
                resolve(hrefs);
            })
            .catch((err) => {
                console.log("возникла ошибка: ", err);
                reject();
            });
    });
}
getMenu('https://reshak.info/', '.tablemenu  a');
getMenu('https://reshak.info/tag/7klass_eng.html', '#pro6 a');
