const fs = require('fs');
const test_data = require('./createFolderTestData.js');
//import 'createFolderTestData';

const debag=true;



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



async function createFoldersFromData(data,path='',level=0) {
    
    if (level == 0 && path != '') {
        await createFolder(path,true);
    }
    level++;

    for(let item in data) { 
        const dataItem=data[item];
        const typeItem=typeof(dataItem);
        

        path_now=path+(level ==1  ? '':'/')+item;

        //console.log(level);
        console.log(path_now);
        await createFolder(path_now,true);
        if (typeItem == 'object') {
            await createFoldersFromData(dataItem,path_now,level);
        }
    }
}
createFoldersFromData(test_data['test_data'],'here/');

//console.log(test_data);