const { google } = require('googleapis');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const os = require('os');

const auth = require('./oauth2_handler');

const logger = require('../utils/logger').logger;

let externalFilePath = path.join("/mnt/hdd", "google-drive");

var gDrive = null;
var count = 1;
var timeInterval = 5000;

function getDriveFiles() {

    auth.authClient(function (error, auth) {

        if (error) {
            logger.error(error);
        }

        gDrive = google.drive({
            version: 'v3',
            auth: auth
        });

        driveList("sharedWithMe", "root", null, externalFilePath);

    });

};

function driveList(query, parentFolderId, nextPageToken, folderPath) {

    gDrive.files.list({
        corpus: 'user',
        orderBy: 'createdTime',
        q: query,
        pageToken: nextPageToken,
        pageSize: 10
    }, (err, { data }) => {

        var token = data.nextPageToken;

        logger.info("Folder Path : " + folderPath);

        if (count > 50) {
            logger.verbose("The count is " + count + " and will be 1");
            count = 1;
        }

        if (data.files.length > 0) {

            data.files.forEach(element => {

                count++;

                if (element.mimeType == "application/vnd.google-apps.folder") {

                    var joinedPath = path.join(folderPath, element.name);

                    if (!fs.existsSync(joinedPath)) {
                        fs.mkdirSync(joinedPath);
                    } else {
                        logger.warn(`Folder exists : ${joinedPath}`);
                    }

                    logger.info("Path : " + joinedPath);

                    setTimeout(() => {

                        logger.info('Getting items in ' + element.name);

                        driveList(`'${element.id}' in parents`, element.id, null, joinedPath);

                    }, timeInterval * count);

                } else {

                    setTimeout(() => {

                        if (element.mimeType.includes("vnd.google-apps"))
                            exportItem(element.id, path.join(folderPath, element.name), element.mimeType);
                        else
                            download(element.id, path.join(folderPath, element.name), element.mimeType);

                    }, 5000);

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

async function download(fileId, filePath, mimeType) {

    try {

        if (fs.existsSync(filePath)) {
            logger.warn(`File was downloaded : ${filePath}`);
            return;
        }

        const dest = fs.createWriteStream(filePath);

        var res = await gDrive.files.get(
            { fileId, alt: 'media', mimeType: mimeType },
            { responseType: 'stream' }
        );

        res.data
            .on('end', () => {
                logger.info(`Downloaded ${filePath} - ${mimeType}`);
            })
            .on('error', err => {
                logger.error(`Error Downloading ${filePath}`);
            })
            .pipe(dest);

    }
    catch (error) {
        logger.error(`Download Error : ${fileId} - ${filePath} - ${mimeType}`);
    }

};

async function exportItem(fileId, filePath, mimeType) {

    try {

        if (fs.existsSync(filePath)) {
            logger.warn(`File was exported : ${filePath}`);
            return;
        }

        const dest = fs.createWriteStream(filePath);

        var res = await gDrive.files.export(
            { fileId, mimeType: mimeType },
            { responseType: 'stream' }
        );

        res.data
            .on('end', () => {
                logger.info(`Exported ${filePath} - ${mimeType}`);
            })
            .on('error', err => {
                logger.error(`Error Exporting ${filePath}`);
            })
            .pipe(dest);

    }
    catch (error) {
        logger.error(`Export Error : ${fileId} - ${filePath} - ${mimeType}`);
    }

};

module.exports = {
    getDriveFiles
}