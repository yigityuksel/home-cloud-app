const path = require('path');
const auth = require('./googleOauth2Handler');
const handler = require('../system/systemHandler');
const driveList = require('./driveListProcess');
const externalFilePath = path.join("/mnt/hdd", "google-drive");

function initalSyncDriveFiles() {

    auth.getGoogleApi(function (err, googleApi) {

        var systemHandler = new handler();
        systemHandler.add(new driveList(googleApi, "sharedWithMe", "root", null, externalFilePath));
        systemHandler.start(0);

    });

}

module.exports = {
    initalSyncDriveFiles
}