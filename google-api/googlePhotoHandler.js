const fs = require('fs');
const path = require('path');
const auth = require('./googleOauth2Handler');
const { google } = require('googleapis');
const logger = require('../utils/logger').logger;
const exportProcess = require('./exportProcess');
const downloadProcess = require('./downloadProcess');
const externalFilePath = path.join("/mnt/hdd", "google-drive");
const timeInterval = 200;

let count = 1;
let export_ = null;
let download_ = null;

let arr = [];

function googlePhotoHandler(callback) {

    auth.getGoogleApi(function (err, googleApi) {

        if (err)
            callback(null);

        export_ = new exportProcess(googleApi);
        download_ = new downloadProcess(googleApi);

        callback(googleApi);

    });

}

function initalSyncDriveFiles() {

    driveList("sharedWithMe", "root", null, externalFilePath);

};

function getStartPageToken(token) {

    googlePhotoHandler(function (googleAuth) {

        googleAuth.changes.list({ pageToken: token, pageSize: 1000 }, (err, { data }) => {

            console.log("Token : " + data.nextPageToken + " Count : " + data.changes.length);

            data.changes.forEach(element => {
                arr.push(element);
            });

            if (data.nextPageToken != undefined) {
                getStartPageToken(data.nextPageToken);
            } else {
                logger.info(JSON.stringify(arr));
            }

        });

    });

}

function getFile() {

    googlePhotoHandler(function (googleAuth) {

        googleAuth.files.get({ fileId: '1_C7HsF4gffMYCNILj13yBoqB_Zxr862cEEkx8hV4fMw' }, (err, { data }) => {

            console.log(data);

        });

    });

}

function driveList(query, parentFolderId, nextPageToken, folderPath) {

    setTimeout(() => {
        googlePhotoHandler(function (googleAuth) {
            googleAuth.files.list({
                corpus: 'user',
                orderBy: 'createdTime',
                q: query,
                pageToken: nextPageToken,
                pageSize: 100
            }, (err, { data }) => {

                logger.info("Fetched Folder Path : " + folderPath);

                data.files.forEach(element => {

                    var itemPath = path.join(folderPath, element.name);

                    if (element.mimeType == "application/vnd.google-apps.folder") {

                        if (!fs.existsSync(itemPath)) {
                            logger.info("Folder is creating : " + itemPath);
                            fs.mkdirSync(itemPath);
                        }
                        else {
                            logger.warn(`Folder exists : ${itemPath}`);
                        }

                        logger.info('Fetching items in ' + element.name);

                        driveList(`'${element.id}' in parents`, element.id, null, itemPath);

                    } else {

                        DownloadOrExport({
                            fileId: element.id,
                            filePath: itemPath,
                            mimeType: element.mimeType
                        })

                    }

                });

                if (data.nextPageToken != null)
                    driveList(query, parentFolderId, data.nextPageToken, folderPath);

            });
        });
    }, timeInterval * count);

}

function DownloadOrExport(item) {

    return;

    if (item.mimeType.includes("vnd.google-apps"))
        export_.exportItemArr.push(item);
    else
        download_.downloadItemArr.push(item);

}

module.exports = {
    initalSyncDriveFiles,
    getStartPageToken,
    getFile
}