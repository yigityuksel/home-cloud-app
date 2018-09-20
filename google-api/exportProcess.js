const fs = require('fs');
const logger = require('../utils/logger').logger;
const systemBase = require('../system/systemBase');

module.exports = class exportProcess extends systemBase {

    constructor(googleDrive_, fileProperties_) {
        super();
        this.googleDrive = googleDrive_;
        this.fileProperties = fileProperties_;
    }

    call(callback) {

        new Promise(async (resolve, reject) => {

            try {

                if (fs.existsSync(this.fileProperties.filePath)) {
                    logger.warn(`File was exported : ${this.fileProperties.filePath}`);
                    callback(true);
                    return;
                }

                const dest = fs.createWriteStream(this.fileProperties.filePath);

                var res = await this.googleDrive.files.export(
                    {
                        fileId: this.fileProperties.fileId,
                        mimeType: this.fileProperties.mimeType
                    },
                    {
                        responseType: 'stream'
                    }
                );

                res.data
                    .on('end', () => {
                        logger.info(`Exported ${this.fileProperties.filePath} - ${this.fileProperties.mimeType}`);
                        callback(true);
                    })
                    .on('error', err => {
                        logger.error(`Error Exporting ${this.fileProperties.filePath}`);
                        callback(false);
                    })
                    .pipe(dest);

            }
            catch (error) {

                logger.error(`Export Error : ${this.fileProperties.fileId} - ${this.fileProperties.filePath} - ${this.fileProperties.mimeType}`);
                callback(true);

            }

        });

    }

}