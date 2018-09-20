const fs = require('fs');
const logger = require('../utils/logger').logger;
const systemBase = require('../system/systemBase');

module.exports = class downloadProcess extends systemBase {

    constructor(googleDrive_, fileProperties_) {
        super();
        this.googleDrive = googleDrive_;
        this.fileProperties = fileProperties_;
    }

    call(callback) {

        new Promise(async (resolve, reject) => {

            try {

                if (fs.existsSync(this.fileProperties.filePath)) {
                    logger.warn(`File was downloaded : ${this.fileProperties.filePath}`);
                    callback(true);
                    return;
                }

                const dest = fs.createWriteStream(this.fileProperties.filePath);
                let progress = 0;

                var res = await this.googleDrive.files.get(
                    {
                        fileId: this.fileProperties.fileId,
                        alt: 'media',
                        mimeType: this.fileProperties.mimeType
                    },
                    {
                        responseType: 'stream'
                    }
                );

                res.data
                    .on('end', () => {
                        logger.info(`Downloaded ${this.fileProperties.filePath} - ${this.fileProperties.mimeType}`);
                        callback(true);
                    })
                    .on('error', err => {
                        logger.error(`Error Downloading ${this.fileProperties.filePath}`);
                        callback(false);
                    })
                    .on('data', d => {
                        progress += d.length;
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Downloading ${progress} bytes - ${this.fileProperties.filePath}`);
                    })
                    .pipe(dest);

            }
            catch (error) {

                logger.error(`Download Error : ${this.fileProperties.fileId} - ${this.fileProperties.filePath} - ${this.fileProperties.mimeType}`);
                callback(true);

            }

        });

    }

}