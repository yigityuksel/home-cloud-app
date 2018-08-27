const { google } = require('googleapis');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const os = require('os');

const auth = require('./oauth2_handler');

const logger = require('../utils/logger').logger;

let externalFilePath = path.join("/mnt/hdd", "google-drive");

var gDrive = null;
var latestFolderName = "";

var folderStructure = [];
var count = 1;

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

        if (count > 100) {
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

                    folderStructure.push({
                        parentFolderId: parentFolderId,
                        kind: element.kind,
                        id: element.id,
                        name: element.name,
                        mimeType: element.mimeType,
                        path: joinedPath
                    });

                    logger.info("Path : " + joinedPath);

                    setTimeout(() => {

                        logger.info('Getting items in ' + element.name);

                        driveList(`'${element.id}' in parents`, element.id, null, joinedPath);

                    }, 500 * count);

                } else {

                    folderStructure.push({
                        parentFolderId: parentFolderId,
                        kind: element.kind,
                        id: element.id,
                        name: element.name,
                        mimeType: element.mimeType,
                        path: folderPath
                    });

                    download(element.id, path.join(folderPath, element.name));

                }
            });

            if (token != null) {

                setTimeout(() => {
                    driveList(query, parentFolderId, token, folderPath);
                }, 500 * count);

            }

        }

    });

}

async function download(fileId, filePath) {

    try {

        if (fs.existsSync(filePath)) {
            logger.warn(`File was downloaded : ${filePath}`);
            return;
        }

        const dest = fs.createWriteStream(filePath);

        let progress = 0;

        var res = await gDrive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        res.data
            .on('end', () => {
                logger.info(`Downloaded ${filePath}`);
            })
            .on('error', err => {
                logger.error(`Error Downloading ${filePath}`);
            })
            .pipe(dest);


    } catch (error) {

        logger.error(`Try - Catch Error : ${error}`);

    }

};

module.exports = {
    getDriveFiles
}