const { google } = require('googleapis');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const os = require('os');

const auth = require('./oauth2_handler');

const errorLog = require('../utils/logger').errorlog;
const successlog = require('../utils/logger').successlog;

let externalFilePath = path.join("/mnt/hdd", "google-drive");

var gDrive = null;
var latestFolderName = "";

function getDriveFiles() {

    auth.authClient(function (error, auth) {

        if (error) {
            errorLog.error(error);
        }

        gDrive = google.drive({
            version: 'v3',
            auth: auth
        });

        driveList(null);

    });

};

function driveList(token) {

    gDrive.files.list({
        corpus: 'user',
        pageSize: 10,
        orderBy: 'createdTime',
        pageToken: token
    }, (err, { data }) => {

        var token = data.nextPageToken;

        console.log(data.files);

        data.files.forEach(element => {

            if (element.mimeType == "application/vnd.google-apps.folder") {

                var joinedPath = path.join(externalFilePath, element.name);

                if (!fs.existsSync(joinedPath)) {

                    fs.mkdirSync(joinedPath);
                    latestFolderName = element.name;

                }

                successlog.info(`New Folder Found : ${latestFolderName}`);

            } else {

                successlog.info(`\t ${element.name}`);

                download(element.id, path.join(latestFolderName, element.name));
            }

        });

        setTimeout(() => {

            successlog.info('New Request Made with new Token.');

            driveList(token);

        }, 2000);

    });

}

async function download(fileId, fileName) {

    try {

        const filePath = path.join(externalFilePath, fileName);
        const dest = fs.createWriteStream(filePath);

        let progress = 0;

        var res = await gDrive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        res.data
            .on('end', () => {
                successlog.info(`Downloaded ${latestFolderName}`);
            })
            .on('error', err => {
                errorLog.error(`Error Downloading ${latestFolderName}`);
            })
            .pipe(dest);


    } catch (error) {

        errorLog.error(`Try - Catch Error : ${error.message}`);

    }

};

module.exports = {
    getDriveFiles
}