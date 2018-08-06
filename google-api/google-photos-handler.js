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

        if (data == null || data == undefined) {

            errorLog.info(err);

            setTimeout(() => {

                successlog.info('Previous request failed re-trying in 10 sec with same token.');

                driveList(token);

            }, 10000);

        } else {

            var token = data.nextPageToken;

            data.files.forEach(element => {

                if (element.mimeType == "application/vnd.google-apps.folder") {

                    var joinedPath = path.join(externalFilePath, element.name);

                    if (!fs.existsSync(joinedPath)) {

                        fs.mkdirSync(joinedPath);
                        
                    } else {

                        successlog.info(`New Folder Found : ${latestFolderName}`);

                    }

                    latestFolderName = element.name;

                } else {

                    download(element.id, path.join(externalFilePath, latestFolderName, element.name));

                }

            });

            setTimeout(() => {

                successlog.info('New Request has been made.');

                driveList(token);

            }, 2000);

        }

    });

}

async function download(fileId, filePath) {

    try {

        if (!fs.existsSync(filePath)) {

            const dest = fs.createWriteStream(filePath);

            var res = await gDrive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );

            res.data
                .on('end', () => {
                    successlog.info(`Downloaded ${filePath}`);
                })
                .on('error', err => {
                    errorLog.error(`Error Downloading ${filePath}`);
                })
                .pipe(dest);

        } else {

            errorLog.error(`File exists ${filePath}`)

        }

    } catch (error) {

        errorLog.error(`Try - Catch Error : ${error.message}`);

    }

};

module.exports = {
    getDriveFiles
}