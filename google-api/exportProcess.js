const fs = require('fs');
const logger = require('../utils/logger').logger;
let googleDrive = null;

var successCount = 0;
var errorCount = 0;

exportProcess.prototype.exportItemArr = [];

exportProcess.prototype.exportItemArr.push = function (item) {
    Array.prototype.push.apply(this, arguments);
    exportItem(item);
}

function exportProcess(gDrive) {
    googleDrive = gDrive;
}

async function exportItem(fileProperties) {

    return new Promise(async (resolve, reject) => {

        try {

            if (fs.existsSync(fileProperties.filePath)) {
                logger.warn(`File was exported : ${fileProperties.filePath}`);
                resolve();
                return;
            }

            const dest = fs.createWriteStream(fileProperties.filePath);

            var res = await googleDrive.files.export(
                {
                    fileId: fileProperties.fileId,
                    mimeType: fileProperties.mimeType
                },
                {
                    responseType: 'stream'
                }
            );

            res.data
                .on('end', () => {
                    logger.info(`Exported ${fileProperties.filePath} - ${fileProperties.mimeType}`);
                    successCount++;
                    resolve(fileProperties.filePath);
                })
                .on('error', err => {
                    logger.error(`Error Exporting ${fileProperties.filePath}`);
                    reject(err.message);
                })
                .pipe(dest);

        }
        catch (error) {
            
            errorCount++;
            logger.error(`Export Error : ${fileProperties.fileId} - ${fileProperties.filePath} - ${fileProperties.mimeType}`);

        }

        logger.info("Total Export " + exportProcess.prototype.exportItemArr.length  +  " Success/Error : " + successCount + "/" + errorCount);

    });

};

module.exports = exportProcess;