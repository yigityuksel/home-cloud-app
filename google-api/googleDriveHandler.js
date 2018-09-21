const path = require('path');
const auth = require('./googleOauth2Handler');
const handler = require('../system/systemHandler');
const driveList = require('./driveListProcess');
const externalFilePath = path.join("/mnt/hdd", "google-drive");

function InitialDriveSync() {

    auth.getGoogleApi(function (err, googleApi) {

        var systemHandler = new handler();
        systemHandler.add(new driveList(googleApi, "sharedWithMe", "root", null, externalFilePath));
        systemHandler.start(0);

    });

}

function getStartPageToken(token) {

    auth.getGoogleApi(function (err, googleApi) {

        getFullPath(googleApi, '1e6-C01VZdOsKa0DbgZidfIF5jPbmaX6A', undefined, function (y) {

            console.log("y " + y);

        });

    });

}

function getFile(fileId_) {

    auth.getGoogleApi(function (err, googleApi) {

        googleApi.files.get({ fileId: fileId_, fields: "kind, id, name, mimeType, parents" }, (error, { data }) => {

            console.log(data);

        });

    });

}

function getFullPath(googleApi, fileId_, fileName, callback) {

    googleApi.files.get({ fileId: fileId_, fields: "kind, id, name, mimeType, parents" }, (error, { data }) => {

        if (data.parents != undefined) {

            var filePath = "";

            if (fileName == undefined) {
                filePath = data.name;
            } else {
                filePath = data.name + "/" + fileName
            }

            var cb = callback;

            getFullPath(googleApi, data.parents[0], filePath, function (x) {

                console.log("h " + x);
                cb(x);

            });

        } else {

            console.log("jer : " + data.name + "/" + fileName);

            callback(data.name + "/" + fileName);

        }

    });


}

module.exports = {
    InitialDriveSync,
    getStartPageToken
}