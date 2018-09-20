const fs = require('fs');
const path = require('path');

const exportProcess = require('./exportProcess');
const downloadProcess = require('./downloadProcess');
const handler = require('../system/systemHandler');
const systemBase = require('../system/systemBase');
const logger = require('../utils/logger').logger;

module.exports = class driveListProcess extends systemBase {

    constructor(googleAuth, query, parentFolderId, nextPageToken, folderPath) {
        super();
        this.googleAuth = googleAuth;
        this.query = query;
        this.parentFolderId = parentFolderId;
        this.nextPageToken = nextPageToken;
        this.folderPath = folderPath;
        this.systemHandler = new handler();
    }

    call(callback) {

        this.googleAuth.files.list({
            corpus: 'user',
            orderBy: 'createdTime',
            q: this.query,
            pageToken: this.nextPageToken,
            pageSize: 100
        }, (err, { data }) => {

            logger.info("Fetched Folder Path : " + this.folderPath);

            data.files.forEach(element => {

                var itemPath = path.join(this.folderPath, element.name);

                if (element.mimeType == "application/vnd.google-apps.folder") {

                    if (!fs.existsSync(itemPath)) {
                        logger.info("Folder is creating : " + itemPath);
                        fs.mkdirSync(itemPath);
                    }
                    else {
                        logger.warn(`Folder exists : ${itemPath}`);
                    }

                    logger.info('Fetching items in ' + element.name);

                    this.systemHandler.add(new driveListProcess(this.googleAuth, `'${element.id}' in parents`, element.id, null, itemPath));

                } else {

                    var item = {
                        fileId: element.id,
                        filePath: itemPath,
                        mimeType: element.mimeType
                    };

                    if (item.mimeType.includes("vnd.google-apps")) {
                        this.systemHandler.add(new exportProcess(this.googleAuth, item));
                    }
                    else {
                        this.systemHandler.add(new downloadProcess(this.googleAuth, item));
                    }

                }

            });

            if (data.nextPageToken != null)
                this.systemHandler.add(new driveListProcess(this.googleAuth, this.query, this.parentFolderId, data.nextPageToken, this.folderPath));

            callback(true);

        });

    }

};