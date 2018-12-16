const rp = require("request-promise").defaults({ encoding: 'latin1' });
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const iconv  = require('iconv-lite');
//iconv.skipDecodeWarning = true;
let headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    'Accept-Encoding': "*"
};

function getBookParser(){
    return new Promise(async (resolve, reject) => {

        let slidemenu = document.querySelector('.contentlist-index');

        if (slidemenu)
            slidemenu = slidemenu.querySelector('#slidemenu');
        else
            slidemenu = null;

        const razdel = document.querySelector('#razdel');
        if(razdel) {
            var task_list = {};

            for (var task of razdel.querySelectorAll('a')) {
                if (task.getAttribute('href').slice(-3) != 'old') {
                    task_list[task.textContent] = task.getAttribute('href');
               }
            }
            // console.log(task_list);
            resolve (task_list);
        }
        if (slidemenu) {
            const units = slidemenu.querySelectorAll('.sublnk1');
            const unit_names = slidemenu.querySelectorAll('span.sublnk');

            let unit_list = {};
            let name_book = document.querySelector('h1').textContent;
            unit_list[name_book]={};
            for (let i = 0; i < units.length; i++) {
                unit_list[name_book][unit_names[i].textContent] = {};

                for (let unit of units) {
                    let part_name = null;

                    for (let child of unit.childNodes) {
                        if (child.nodeType === 3 && child.textContent.trim().length > 3) {
                            part_name = child.textContent.trim();

                            unit_list[name_book][unit_names[i].textContent][part_name] = {};
                        } else if (child.nodeType === 1) {
                            if (part_name && child.getAttribute('href'))
                                unit_list[name_book][unit_names[i].textContent][part_name][child.textContent] = child.getAttribute('href');
                        }
                    }
                }
            }
            resolve (unit_list);
        }
    })
}
let options = {
    url: 'https://reshak.ru/spotlight11/index.html',
    headers: headers,
    transform(body){
        var dom = new JSDOM(iconv.decode(body, 'cp1251'));
        document = dom.window.document;
        console.log(document);
        return document;
    }
};



function getBook(url) {
    return new Promise(async (resolve, reject) => {
        options.url = url;
        await rp(options).then(async (document) => {
            let structBook = await getBookParser(document);
            console.log('structBook')
            resolve(structBook);
        }).catch((err) => {
            console.debug(' ошибка в запросе getBook ' + err);
            reject (err);
        });
    })
}
module.exports = getBook;