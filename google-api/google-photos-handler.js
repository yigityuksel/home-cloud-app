const { google } = require('googleapis');
const fs = require('fs');
const os = require('os');
const uuid = require('uuid');
const path = require('path');

function getDriveFiles(auth, callback) {

    var latestFolderName = "";

    google.drive({
        version: 'v3',
        auth: auth
    }).files.list({
        corpus: 'user',
        pageSize: 100,
        orderBy: 'createdTime'
    }, (err, { data }) => {

        data.files.forEach(element => {

            if (element.mimeType == "application/vnd.google-apps.folder") {
                fs.mkdirSync(path.join(os.tmpdir(), "test", element.name));
                latestFolderName = element.name;
            } else {
                downloadDriveFile(element.id, latestFolderName + "\\" + element.name, auth);
            }

        });

    });

};

async function downloadDriveFile(fileId, fileName, auth) {

    return new Promise(async (resolve, reject) => {

        try {

            const filePath = path.join(os.tmpdir(), "test", fileName);
            const dest = fs.createWriteStream(filePath);

            console.log(`writing to ${filePath}`);

            let progress = 0;

            const res = await google.drive({
                version: 'v3',
                auth: auth
            }).files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );

            res.data
                .on('end', () => {
                    console.log('Done downloading file.');
                    resolve(filePath);
                })
                .on('error', err => {
                    console.error('Error downloading file.');
                    reject(err);
                })
                .on('data', d => {
                    progress += d.length;
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Downloaded ${progress} bytes`);
                })
                .pipe(dest);

        }
        catch (e) {
            console.log(e.stack)
            return null
        }

    });

};

module.exports = {
    getDriveFiles,
    downloadDriveFile
}