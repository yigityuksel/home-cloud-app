const fs = require('fs');
const logger = require('../utils/logger').logger;
let googleDrive = null;

var successCount = 0;
var errorCount = 0;

downloadProcess.prototype.downloadItemArr = [];

downloadProcess.prototype.downloadItemArr.push = function (item) {

    Array.prototype.push.apply(this, arguments);

    setTimeout(() => {
        downloadItem(item);
    }, 200 * this.length);

}

function downloadProcess(gDrive) {
    googleDrive = gDrive;
}

async function downloadItem(fileProperties, callback) {

    return new Promise(async (resolve, reject) => {

        try {

            if (fs.existsSync(fileProperties.filePath)) {
                logger.warn(`File was downloaded : ${fileProperties.filePath}`);
                resolve();
                return;
            }

            const dest = fs.createWriteStream(fileProperties.filePath);

            var res = await googleDrive.files.get(
                {
                    fileId: fileProperties.fileId,
                    alt: 'media',
                    mimeType: fileProperties.mimeType
                },
                {
                    responseType: 'stream'
                }
            );

            res.data
                .on('end', () => {
                    successCount++;
                    logger.info(`Downloaded ${fileProperties.filePath} - ${fileProperties.mimeType} - Total ${downloadProcess.prototype.downloadItemArr.length} Success/Error : ${successCount} / ${errorCount}`);
                    resolve(fileProperties.filePath);
                })
                .on('error', err => {
                    logger.error(`Error Downloading ${fileProperties.filePath}`);
                    reject(err.message);
                })
                .pipe(dest);

        }
        catch (error) {

            errorCount++;
            logger.error(`Download Error : ${fileProperties.fileId} - ${fileProperties.filePath} - ${fileProperties.mimeType}`);

        }


    });

    resolve();

};

module.exports = downloadProcess;