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
    function saveImg(data) {
        fs.writeFile(name, data, 'binary', function(err){
            if (err){
                console.error('картинка мутит повор сохранения в файл')
                saveImg(data);
            }
            console.log('File saved.');
        })
    }
    return new Promise(async (resolve, reject) => {
        options.url = url;
        await rp(options)
            .then((data) => {
                console.log(data);
                saveImg(data);
            })
            .catch(async (err) => {
                console.log("возникла ошибка: ", err);
                await downloadImg (url, name);
                reject();
            });
    })
}

async function save_text(name, $, url=""){
    return new Promise(async (resolve, reject) => {
        let el = $("#table_otvet").find("div").text();
        let text = "";
        if(el.includes("« Предыдущий ответ Следующий ответ »")) {
            text = el.substr(0, el.indexOf("« Предыдущий ответ Следующий ответ »"))
        }
        if(!el.includes("« Предыдущий ответ Следующий ответ »")){
            let toLen = el.includes("« Предыдущий ответ") ? el.indexOf("« Предыдущий ответ") :  el.indexOf("Следующий ответ »");
            text = el.substr(0, toLen);
        }
        if (text === ''){
            reject("error: нет текста"+url);
            await save_text(name, $)
        }
        fs.writeFile(name , text ? text : "error write", function  (error){
            if(error){
                throw error; // если возникла ошибка

            }
            console.log("Асинхронная запись файла завершена.", name);
            resolve(true);
        });
    })
}

function getContent(url, pathDir) {
    return new Promise(async (resolve, reject) => {
        options.url = 'https://reshak.ru' + url;
        options.transform = function(body){
            body = iconv.encode(iconv.decode(new Buffer(body,'binary'),'win1251'),'utf8');
            return cheerio.load(body);
        };
        await rp(options)
            .then(async ($) => {
                let elements = $(".maincontfull div");
                let countImg = 0;
                for(var i = 0; i< elements.length-1; i++){
                    let el = elements[i];
                    const elClass = $(el).attr('class');
                    if (elClass === "ya-share2" || elClass === "ya-share2 ya-share2_inited" ) {
                        break;
                    }
                    let srcImg = $(el).find("img").attr('src');
                    if (typeof srcImg !== 'undefined' && $(el).find("img").attr('class') !== 'border'){
                        setTimeout(async ()=> {
                            console.log(`downloadImg https://reshak.ru${srcImg}`, path(pathDir));
                            const pathing = path.join(pathDir, Math.random().toFixed(3) + path.extname(srcImg));
                            await downloadImg(`https://reshak.ru${srcImg}`, pathing);
                            countImg++;
                            resolve(1);
                        })
                    }
                }
                if(!countImg){
                    setTimeout(async ()=> {
                        const pathing = path.join(pathDir, Math.random().toFixed(3) + '.txt');
                        await save_text(pathing, $,url);
                        resolve(true);
                    })
                }
            }).catch(async (err)=>{
                console.log('mutit zapros', url, pathDir)
                reject(err);
                await getContent(url, pathDir)
            })
    })
}
//getContent("/otvet/otvet_txt.php?otvet1=/spotlight8/images/module1/a/3");
module.exports = getContent;