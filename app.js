const readline = require('readline');

const getBook = require('./getBook.js');

const createFolders = require('./creatFolders');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Вставте ссылку на книгу? ', (url) => {
    // TODO: Log the answer in a database
    //url = 'https://reshak.ru/spotlight11/index.html'
    console.log(`url: ${url}`);
    getBook(url).then(async (obj)=>{
        console.log('get book')
        await createFolders(obj, './href/');
    }).catch((err)=>{console.log(err)});
    rl.close();
});