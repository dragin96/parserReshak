const fs = require('fs');
const rp = require("request-promise").defaults({ encoding: 'latin1' });
const cheerio = require('cheerio');
const iconv  = require('iconv-lite');

let headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
    'Accept-Encoding': "*"
};
let options = {
    headers: headers

};

function downloadImg (url, name) {
    return new Promise(async (resolve, reject) => {
        options.url = url;
        await rp(options)
            .then((data) => {
                let imagedata = data;
                fs.writeFile(name, imagedata, 'binary', function(err){
                    if (err) throw err
                    console.log('File saved.');
                    resolve(true);
                })
            })
            .catch((err) => {
                console.log("возникла ошибка: ", err);
                reject();
            });

    })
}


//downloadImg('https://reshak.info/reshebniki/informatika/7/bosova/images1/1-2.png', '1-2');

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