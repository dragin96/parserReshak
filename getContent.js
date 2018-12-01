const fs = require('fs');
const rp = require("request-promise").defaults({ encoding: 'latin1' });
const cheerio = require('cheerio');
const iconv  = require('iconv-lite');
const path = require('path');


let headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    'Accept-Encoding': "*"
};
let options = {
    headers: headers

};

function downloadImg (url, name) {
    return new Promise(async (resolve, reject) => {
        let http = require('https');
        let fs = require('fs');

        let file = fs.createWriteStream(name);
        let request = http.get(url, function(response) {
            response.pipe(file);
            resolve(true)
        });

    })
}


//downloadImg('https://reshak.info/reshebniki/informatika/7/bosova/images1/1-2.png', '1-2.jpg');

function save_text(url, name){
    return new Promise(async (resolve, reject) => {
        options.url = url;
        options.transform = function(body){
            body = iconv.encode(iconv.decode(new Buffer(body,'binary'),'win1251'),'utf8');
            return cheerio.load(body);
        };
        await rp(options)
            .then(($) => {
                let el = $("#table_otvet").find("div").text();
                let text = "";
                console.log(el)
                if(el.includes("« Предыдущий ответ Следующий ответ »")) {
                    text = el.substr(0, el.indexOf("« Предыдущий ответ Следующий ответ »"))
                }
                if(!el.includes("« Предыдущий ответ Следующий ответ »")){
                    let toLen = el.includes("« Предыдущий ответ") ? el.indexOf("« Предыдущий ответ") :  el.indexOf("Следующий ответ »");
                    text = el.substr(0, toLen);
                }
                if (text === ''){
                    reject("error: нет текста");
                }
                fs.writeFile(name + ".txt", text ? text : "error write", function(error){
                    if(error) throw error; // если возникла ошибка
                    console.log("Асинхронная запись файла завершена. Содержимое файла:");
                    let data = fs.readFileSync(name + ".txt", "utf8");
                    console.log(data);  // выводим считанные данные
                    resolve(true);
                });
            })
    })
}


//save_text('https://reshak.info/otvet/otvet_txt.php?otvet1=/rainbow7/images/Unit1/Step10/7', '7')

function getImg(url) {
    return new Promise(async (resolve, reject) => {
        options.url = url;
        options.transform = function(body){
            body = iconv.encode(iconv.decode(new Buffer(body,'binary'),'win1251'),'utf8');
            return cheerio.load(body);
        };
        await rp(options)
            .then(($) => {
                let elements = $(".maincontfull div");
                for(var i = 0; i< elements.length-1; i++){
                    let el = elements[i];
                    elClass = $(el).attr('class');
                    if (elClass === "ya-share2" || elClass === "ya-share2 ya-share2_inited" ) {
                        break;
                    }
                    let srcImg = $(el).find("img").attr('src');
                    if (typeof srcImg !== 'undefined' && $(el).find("img").attr('class') !== 'border'){
                        console.log(`https://reshak.info${srcImg}`)
                        downloadImg(`https://reshak.info${srcImg}`, path.posix.basename(srcImg));
                    }
                }
            })
    })
}

getImg("https://reshak.info/otvet/otvet_txt.php?otvet1=/spotlight8/images/module1/a/3");