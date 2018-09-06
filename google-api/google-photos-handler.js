const fs = require('fs');
const path = require('path');
const auth = require('./oauth2_handler');
const { google } = require('googleapis');
const logger = require('../utils/logger').logger;
const exportProcess = require('./exportProcess');
const downloadProcess = require('./downloadProcess');
const externalFilePath = path.join("/mnt/hdd", "google-drive");
const timeInterval = 2000;

let count = 1;
let gDrive = null;
let export_ = null;
let download_ = null;

function getDriveFiles() {

    auth.authClient(function (error, auth) {

        if (error)
            logger.error(error);

        gDrive = google.drive({
            version: 'v3',
            auth: auth
        });

        export_ = new exportProcess(gDrive);
        download_ = new downloadProcess(gDrive);

        driveList("sharedWithMe", "root", null, externalFilePath);

    });

};

function driveList(query, parentFolderId, nextPageToken, folderPath) {

    gDrive.files.list({
        corpus: 'user',
        orderBy: 'createdTime',
        q: query,
        pageToken: nextPageToken,
        pageSize: 200
    }, (err, { data }) => {

        var token = data.nextPageToken;

        logger.info("Folder Path : " + folderPath);

        if (data.files.length > 0) {

            data.files.forEach(element => {

                fixCount();

                if (element.mimeType == "application/vnd.google-apps.folder") {

                    var joinedPath = path.join(folderPath, element.name);

                    logger.info("Path : " + joinedPath);

                    if (!fs.existsSync(joinedPath))
                        fs.mkdirSync(joinedPath);
                    else
                        logger.warn(`Folder exists : ${joinedPath}`);

                    setTimeout(() => {

                        logger.info('Getting items in ' + element.name);

                        driveList(`'${element.id}' in parents`, element.id, null, joinedPath);

                    }, timeInterval * count);

                } else {

                    var item = {
                        fileId: element.id,
                        filePath: path.join(folderPath, element.name),
                        mimeType: element.mimeType
                    };

                    if (element.mimeType.includes("vnd.google-apps"))
                        export_.exportItemArr.push(item);
                    else
                        download_.downloadItemArr.push(item);

                }

            });

            if (token != null) {

                setTimeout(() => {
                    driveList(query, parentFolderId, token, folderPath);
                }, timeInterval * count);

            }

        }

    });

}

function fixCount(){

    count++;

    if (count > 25) {
        logger.verbose("The count is " + count + " and will be 1");
        count = 1;
    }

}

module.exports = {
    getDriveFiles
}