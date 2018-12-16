const fs = require('fs');
const debag=true;
const path = require('path');
const getContent = require('./getContent');

function createFolder(nameFolder,debag=false) {
    return new Promise(async (resolve, reject) => {
        //сделать замену плохих символов
        fs.exists(nameFolder, (exists) => {
            if ( ! exists ) {

                fs.mkdir(nameFolder, { recursive: true }, (err) => {
                    if (err) {
                        reject(err)
                    }
                    if(debag){console.log(`dir ${nameFolder} created`);}
                    resolve(true);
                    //return true; //не работает возврат, исправить
                });

            }
            else {
                if(debag){
                    console.log(`dir ${nameFolder} exists`);
                }
                resolve(true);
            }
        });
    });

}



function createFoldersFromData(data, dirname='', level=0) {
    return new Promise(async (resolve, reject) => {

        if (level === 0 && dirname !== '') {
            await createFolder(dirname, true);
        }
        level++;

        for (let item in data) {
            const dataItem = data[item];
            const typeItem = typeof (dataItem);
            let path_now = dirname + (level === 1 ? '' : '/') + item;

            //console.log(level);
            console.log(path_now);
            await createFolder(path_now, true);
            if (typeItem === 'object') {
                setTimeout(async ()=> { await createFoldersFromData(dataItem, path_now, level);})
            }
            if (typeItem === 'string') {
                console.log("getContent",path_now, dataItem);
                setTimeout(async ()=> {await getContent( dataItem, path_now);})
            }
        }
    })
}
module.exports = createFoldersFromData;
//createFoldersFromData(test_data['test_data'],'here/');
